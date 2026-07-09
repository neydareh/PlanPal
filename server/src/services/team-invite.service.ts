import { createHash, randomBytes } from "crypto";
import { and, eq, lt } from "drizzle-orm";
import { getDb } from "../db";
import { teamInvites, teamMemberships } from "server/shared/schema";
import { CreateTeamInviteDTO } from "../interfaces/dto";
import { TeamInvite, TeamMembership } from "../interfaces/models";

const DEFAULT_INVITE_EXPIRATION_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export class TeamInviteService {
  async createInvite(
    teamId: string,
    createdBy: string,
    data: CreateTeamInviteDTO,
  ): Promise<{ invite: TeamInvite; token: string }> {
    const db = getDb();
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresInDays =
      data.expiresInDays ?? DEFAULT_INVITE_EXPIRATION_DAYS;
    const expiresAt = new Date(Date.now() + expiresInDays * DAY_MS);

    const [invite] = await db
      .insert(teamInvites)
      .values({
        teamId,
        email: normalizeEmail(data.email),
        role: data.role,
        memberFunction: data.role === "admin" ? null : data.memberFunction,
        message: data.message ?? null,
        tokenHash,
        status: "pending",
        expiresAt,
        createdBy,
      })
      .returning();

    return { invite: invite as TeamInvite, token };
  }

  async listTeamInvites(teamId: string): Promise<TeamInvite[]> {
    const db = getDb();
    const now = new Date();

    await db
      .update(teamInvites)
      .set({ status: "expired", updatedAt: now })
      .where(
        and(
          eq(teamInvites.teamId, teamId),
          eq(teamInvites.status, "pending"),
          lt(teamInvites.expiresAt, now),
        ),
      );

    const results = await db.query.teamInvites.findMany({
      where: eq(teamInvites.teamId, teamId),
      orderBy: (invites, { desc }) => [desc(invites.createdAt)],
    });

    return results as TeamInvite[];
  }

  async getInviteByToken(token: string): Promise<TeamInvite | null> {
    const db = getDb();
    const tokenHash = hashToken(token);
    const invite = await db.query.teamInvites.findFirst({
      where: eq(teamInvites.tokenHash, tokenHash),
    });

    if (!invite) {
      return null;
    }

    const now = new Date();
    if (invite.status === "pending" && invite.expiresAt < now) {
      const [updated] = await db
        .update(teamInvites)
        .set({ status: "expired", updatedAt: now })
        .where(eq(teamInvites.id, invite.id))
        .returning();
      return updated as TeamInvite;
    }

    return invite as TeamInvite;
  }

  async acceptInvite(
    token: string,
    userId: string,
    userEmail: string,
  ): Promise<TeamMembership> {
    const db = getDb();
    const invite = await this.getInviteByToken(token);
    if (!invite) {
      throw new Error("invite_not_found");
    }

    if (invite.status !== "pending") {
      throw new Error("invite_not_pending");
    }

    const normalizedEmail = normalizeEmail(userEmail);
    if (invite.email !== normalizedEmail) {
      throw new Error("invite_email_mismatch");
    }

    const existing = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMemberships.teamId, invite.teamId),
        eq(teamMemberships.userId, userId),
      ),
    });
    if (existing) {
      throw new Error("duplicate_membership");
    }

    const [membership] = await db
      .insert(teamMemberships)
      .values({
        teamId: invite.teamId,
        userId,
        role: invite.role,
        memberFunction: invite.role === "admin" ? null : invite.memberFunction,
      })
      .returning();

    await db
      .update(teamInvites)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(teamInvites.id, invite.id));

    return membership as TeamMembership;
  }

  async declineInvite(token: string, userEmail: string): Promise<TeamInvite> {
    const db = getDb();
    const invite = await this.getInviteByToken(token);
    if (!invite) {
      throw new Error("invite_not_found");
    }

    if (invite.status !== "pending") {
      throw new Error("invite_not_pending");
    }

    const normalizedEmail = normalizeEmail(userEmail);
    if (invite.email !== normalizedEmail) {
      throw new Error("invite_email_mismatch");
    }

    const [updated] = await db
      .update(teamInvites)
      .set({ status: "declined", updatedAt: new Date() })
      .where(eq(teamInvites.id, invite.id))
      .returning();

    return updated as TeamInvite;
  }

  async regenerateInvite(
    inviteId: string,
    createdBy: string,
  ): Promise<{ invite: TeamInvite; token: string }> {
    const db = getDb();
    const existing = await db.query.teamInvites.findFirst({
      where: eq(teamInvites.id, inviteId),
    });
    if (!existing) {
      throw new Error("invite_not_found");
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const now = new Date();
    const expiresAt =
      existing.expiresAt && existing.expiresAt > now
        ? existing.expiresAt
        : new Date(Date.now() + DEFAULT_INVITE_EXPIRATION_DAYS * DAY_MS);

    await db
      .update(teamInvites)
      .set({ status: "revoked", updatedAt: now })
      .where(eq(teamInvites.id, existing.id));

    const [invite] = await db
      .insert(teamInvites)
      .values({
        teamId: existing.teamId,
        email: existing.email,
        role: existing.role,
        memberFunction: existing.memberFunction,
        message: existing.message,
        tokenHash,
        status: "pending",
        expiresAt,
        createdBy,
      })
      .returning();

    return { invite: invite as TeamInvite, token };
  }
}
