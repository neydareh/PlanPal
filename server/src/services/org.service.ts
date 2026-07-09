import { and, eq } from "drizzle-orm";
import {
  orgTeamMemberships,
  organizations,
  teamMemberships,
  teams,
} from "server/shared/schema";
import { getDb } from "../db";
import {
  AddOrgMemberDTO,
  CreateOrgDTO,
  UpdateOrgDTO,
  UpdateOrgMemberDTO,
} from "../interfaces/dto";
import { Organization, OrgTeamMembership } from "../interfaces/models";

export class OrgService {
  async createOrg(
    userId: string,
    orgData: CreateOrgDTO
  ): Promise<Organization> {
    const db = getDb();
    const [organization] = await db
      .insert(organizations)
      .values({
        name: orgData.name,
        orgCode: orgData.orgCode ?? null,
        createdBy: userId,
      })
      .returning();

    return organization as Organization;
  }

  async getOrgsForUser(userId: string): Promise<Organization[]> {
    const db = getDb();
    const createdOrgs = await db.query.organizations.findMany({
      where: eq(organizations.createdBy, userId),
    });
    const memberships = await db.query.teamMemberships.findMany({
      where: eq(teamMemberships.userId, userId),
      with: {
        team: {
          with: {
            organization: true,
          },
        },
      },
    });

    const orgMap = new Map<string, Organization>();
    for (const organization of createdOrgs) {
      orgMap.set(organization.id, organization as Organization);
    }
    for (const membership of memberships) {
      const organization = membership.team?.organization;
      if (organization && !orgMap.has(organization.id)) {
        orgMap.set(organization.id, organization as Organization);
      }
    }

    return Array.from(orgMap.values());
  }

  async getOrgById(orgId: string) {
    const db = getDb();
    const result = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
      with: {
        teams: true,
        memberships: true,
      },
    });

    if (!result) return null;

    return {
      ...result,
      teamCount: result.teams?.length ?? 0,
      memberCount: result.memberships?.length ?? 0,
    };
  }

  async updateOrg(
    orgId: string,
    orgData: UpdateOrgDTO
  ): Promise<Organization> {
    const db = getDb();
    const [organization] = await db
      .update(organizations)
      .set({
        ...orgData,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, orgId))
      .returning();
    return organization as Organization;
  }

  async deleteOrg(orgId: string): Promise<void> {
    const db = getDb();
    await db.delete(organizations).where(eq(organizations.id, orgId));
  }

  async listOrgMembers(orgId: string) {
    const db = getDb();
    return db.query.orgTeamMemberships.findMany({
      where: eq(orgTeamMemberships.orgId, orgId),
      with: {
        team: true,
      },
    });
  }

  async getOrgMemberById(membershipId: string) {
    const db = getDb();
    const result = await db.query.orgTeamMemberships.findFirst({
      where: eq(orgTeamMemberships.id, membershipId),
    });
    return result ?? null;
  }

  async addOrgMember(
    orgId: string,
    memberData: AddOrgMemberDTO
  ): Promise<OrgTeamMembership> {
    const db = getDb();
    const existing = await db.query.orgTeamMemberships.findFirst({
      where: and(
        eq(orgTeamMemberships.orgId, orgId),
        eq(orgTeamMemberships.teamId, memberData.teamId)
      ),
    });

    if (existing) {
      throw new Error("duplicate membership");
    }

    const [membership] = await db
      .insert(orgTeamMemberships)
      .values({
        orgId,
        teamId: memberData.teamId,
      })
      .returning();

    return membership as OrgTeamMembership;
  }

  async updateOrgMemberRole(
    membershipId: string,
    memberData: UpdateOrgMemberDTO
  ): Promise<OrgTeamMembership> {
    const db = getDb();
    const [membership] = await db
      .update(orgTeamMemberships)
      .set({
        teamId: memberData.teamId,
        updatedAt: new Date(),
      })
      .where(eq(orgTeamMemberships.id, membershipId))
      .returning();
    return membership as OrgTeamMembership;
  }

  async removeOrgMember(membershipId: string): Promise<void> {
    const db = getDb();
    await db
      .delete(orgTeamMemberships)
      .where(eq(orgTeamMemberships.id, membershipId));
  }

  async ensureTeamInOrg(orgId: string, teamId: string) {
    const db = getDb();
    const team = await db.query.teams.findFirst({
      where: and(eq(teams.id, teamId), eq(teams.orgId, orgId)),
    });
    return team ?? null;
  }
}
