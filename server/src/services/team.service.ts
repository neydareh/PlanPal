import { and, eq } from "drizzle-orm";
import { orgTeamMemberships, teamMemberships, teams } from "server/shared/schema";
import { getDb } from "../db";
import {
  AddTeamMemberDTO,
  CreateTeamDTO,
  UpdateTeamDTO,
  UpdateTeamMemberDTO,
} from "../interfaces/dto";
import { Team, TeamMembership } from "../interfaces/models";

export class TeamService {
  async createTeam(
    orgId: string,
    userId: string,
    teamData: CreateTeamDTO
  ): Promise<Team> {
    const db = getDb();
    const [team] = await db
      .insert(teams)
      .values({
        name: teamData.name,
        orgId,
        createdBy: userId,
      })
      .returning();
    await db.insert(orgTeamMemberships).values({
      orgId,
      teamId: team.id,
    });
    return team as Team;
  }

  async getTeamsForOrg(orgId: string): Promise<Team[]> {
    const db = getDb();
    const results = await db.query.teams.findMany({
      where: eq(teams.orgId, orgId),
    });
    return results as Team[];
  }

  async getTeamById(teamId: string): Promise<Team | null> {
    const db = getDb();
    const result = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });
    return result as Team | null;
  }

  async updateTeam(teamId: string, teamData: UpdateTeamDTO): Promise<Team> {
    const db = getDb();
    const [team] = await db
      .update(teams)
      .set({
        ...teamData,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId))
      .returning();
    return team as Team;
  }

  async deleteTeam(teamId: string): Promise<void> {
    const db = getDb();
    await db.delete(teams).where(eq(teams.id, teamId));
    await db
      .delete(orgTeamMemberships)
      .where(eq(orgTeamMemberships.teamId, teamId));
  }

  async listTeamMembers(teamId: string) {
    const db = getDb();
    return db.query.teamMemberships.findMany({
      where: eq(teamMemberships.teamId, teamId),
      with: {
        user: true,
      },
    });
  }

  async getTeamMemberById(membershipId: string) {
    const db = getDb();
    const result = await db.query.teamMemberships.findFirst({
      where: eq(teamMemberships.id, membershipId),
    });
    return result ?? null;
  }

  async addTeamMember(
    teamId: string,
    memberData: AddTeamMemberDTO
  ): Promise<TeamMembership> {
    const db = getDb();
    const existing = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMemberships.teamId, teamId),
        eq(teamMemberships.userId, memberData.userId)
      ),
    });

    if (existing) {
      throw new Error("duplicate membership");
    }

    const [membership] = await db
      .insert(teamMemberships)
      .values({
        teamId,
        userId: memberData.userId,
        memberFunction: memberData.memberFunction,
        role: memberData.role ?? "user",
      })
      .returning();
    return membership as TeamMembership;
  }

  // async updateTeamMember(
  //   membershipId: string,
  //   memberData: UpdateTeamMemberDTO
  // ): Promise<TeamMembership> {
  //   const db = getDb();
  //   const updateData = {
  //     ...memberData,
  //     memberFunction:
  //       memberData.role === "admin"
  //         ? null
  //         : memberData.memberFunction,
  //     updatedAt: new Date(),
  //   };

  //   const [membership] = await db
  //     .update(teamMemberships)
  //     .set(updateData)
  //     .where(eq(teamMemberships.id, membershipId))
  //     .returning();
  //   return membership as TeamMembership;
  // }

  async removeTeamMember(membershipId: string): Promise<void> {
    const db = getDb();
    await db.delete(teamMemberships).where(eq(teamMemberships.id, membershipId));
  }
}
