import { and, eq } from "drizzle-orm";
import {
  orgMemberships,
  organizations,
  teams,
} from "server/shared/schema";
import { getDb, withPoolClient } from "../db";
import {
  AddOrgMemberDTO,
  CreateOrgDTO,
  UpdateOrgDTO,
  UpdateOrgMemberDTO,
} from "../interfaces/dto";
import { Organization, OrgMembership } from "../interfaces/models";
import { provisionOrgSchema, toOrgSchemaName } from "../utils/org-schema";

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
        createdBy: userId,
      })
      .returning();

    await db.insert(orgMemberships).values({
      orgId: organization.id,
      userId,
      role: "admin",
    });

    await withPoolClient(async (client) => {
      const schemaName = toOrgSchemaName(organization.id);
      await provisionOrgSchema(client, schemaName);
      await client.query(
        "UPDATE organizations SET schema_name = $1 WHERE id = $2",
        [schemaName, organization.id]
      );
    });

    return organization as Organization;
  }

  async getOrgsForUser(userId: string): Promise<Organization[]> {
    const db = getDb();
    const memberships = await db.query.orgMemberships.findMany({
      where: eq(orgMemberships.userId, userId),
      with: {
        organization: true,
      },
    });

    return memberships
      .map((membership) => membership.organization)
      .filter(Boolean) as Organization[];
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
    return db.query.orgMemberships.findMany({
      where: eq(orgMemberships.orgId, orgId),
      with: {
        user: true,
      },
    });
  }

  async getOrgMemberById(membershipId: string) {
    const db = getDb();
    const result = await db.query.orgMemberships.findFirst({
      where: eq(orgMemberships.id, membershipId),
    });
    return result ?? null;
  }

  async addOrgMember(
    orgId: string,
    memberData: AddOrgMemberDTO
  ): Promise<OrgMembership> {
    const db = getDb();
    const existing = await db.query.orgMemberships.findFirst({
      where: and(
        eq(orgMemberships.orgId, orgId),
        eq(orgMemberships.userId, memberData.userId)
      ),
    });

    if (existing) {
      throw new Error("duplicate membership");
    }

    const [membership] = await db
      .insert(orgMemberships)
      .values({
        orgId,
        userId: memberData.userId,
        role: memberData.role,
      })
      .returning();

    return membership as OrgMembership;
  }

  async updateOrgMemberRole(
    membershipId: string,
    memberData: UpdateOrgMemberDTO
  ): Promise<OrgMembership> {
    const db = getDb();
    const [membership] = await db
      .update(orgMemberships)
      .set({
        role: memberData.role,
        updatedAt: new Date(),
      })
      .where(eq(orgMemberships.id, membershipId))
      .returning();
    return membership as OrgMembership;
  }

  async removeOrgMember(membershipId: string): Promise<void> {
    const db = getDb();
    await db.delete(orgMemberships).where(eq(orgMemberships.id, membershipId));
  }

  async ensureTeamInOrg(orgId: string, teamId: string) {
    const db = getDb();
    const team = await db.query.teams.findFirst({
      where: and(eq(teams.id, teamId), eq(teams.orgId, orgId)),
    });
    return team ?? null;
  }
}
