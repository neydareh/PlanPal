import crypto from "node:crypto";
import {
  AddOrgMemberDTO,
  AddTeamMemberDTO,
  CreateOrgDTO,
  CreateTeamDTO,
  UpdateOrgDTO,
  UpdateOrgMemberDTO,
  UpdateTeamDTO,
  UpdateTeamMemberDTO,
} from "../../src/interfaces/dto";
import {
  Organization,
  OrgMembership,
  Team,
  TeamMembership,
  User,
} from "../../src/interfaces/models";

type InMemoryStore = {
  users: User[];
  organizations: Organization[];
  orgMemberships: OrgMembership[];
  teams: Team[];
  teamMemberships: TeamMembership[];
};

export class InMemoryOrgService {
  constructor(private store: InMemoryStore) {}

  async createOrg(userId: string, orgData: CreateOrgDTO): Promise<Organization> {
    const organization: Organization = {
      id: crypto.randomUUID(),
      name: orgData.name,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.store.organizations.push(organization);

    const membership: OrgMembership = {
      id: crypto.randomUUID(),
      orgId: organization.id,
      userId,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.store.orgMemberships.push(membership);

    return organization;
  }

  async getOrgsForUser(userId: string): Promise<Organization[]> {
    const orgIds = this.store.orgMemberships
      .filter((membership) => membership.userId === userId)
      .map((membership) => membership.orgId);

    return this.store.organizations.filter((org) => orgIds.includes(org.id));
  }

  async getOrgById(orgId: string) {
    const org = this.store.organizations.find((item) => item.id === orgId);
    if (!org) return null;

    const teamCount = this.store.teams.filter((team) => team.orgId === orgId)
      .length;
    const memberCount = this.store.orgMemberships.filter(
      (membership) => membership.orgId === orgId
    ).length;

    return {
      ...org,
      teamCount,
      memberCount,
    };
  }

  async updateOrg(orgId: string, orgData: UpdateOrgDTO): Promise<Organization> {
    const org = this.store.organizations.find((item) => item.id === orgId);
    if (!org) {
      throw new Error("Organization not found");
    }
    org.name = orgData.name ?? org.name;
    org.updatedAt = new Date();
    return org;
  }

  async deleteOrg(orgId: string): Promise<void> {
    this.store.organizations = this.store.organizations.filter(
      (item) => item.id !== orgId
    );
    this.store.orgMemberships = this.store.orgMemberships.filter(
      (item) => item.orgId !== orgId
    );
    const teamIds = this.store.teams
      .filter((team) => team.orgId === orgId)
      .map((team) => team.id);
    this.store.teams = this.store.teams.filter((team) => team.orgId !== orgId);
    this.store.teamMemberships = this.store.teamMemberships.filter(
      (membership) => !teamIds.includes(membership.teamId)
    );
  }

  async listOrgMembers(orgId: string) {
    return this.store.orgMemberships
      .filter((membership) => membership.orgId === orgId)
      .map((membership) => ({
        ...membership,
        user:
          this.store.users.find((user) => user.id === membership.userId) ??
          null,
      }));
  }

  async addOrgMember(
    orgId: string,
    memberData: AddOrgMemberDTO
  ): Promise<OrgMembership> {
    const existing = this.store.orgMemberships.find(
      (membership) =>
        membership.orgId === orgId && membership.userId === memberData.userId
    );

    if (existing) {
      throw new Error("duplicate membership");
    }

    const membership: OrgMembership = {
      id: crypto.randomUUID(),
      orgId,
      userId: memberData.userId,
      role: memberData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.store.orgMemberships.push(membership);
    return membership;
  }

  async updateOrgMemberRole(
    membershipId: string,
    memberData: UpdateOrgMemberDTO
  ): Promise<OrgMembership> {
    const membership = this.store.orgMemberships.find(
      (item) => item.id === membershipId
    );
    if (!membership) {
      throw new Error("Org member not found");
    }
    membership.role = memberData.role;
    membership.updatedAt = new Date();
    return membership;
  }

  async removeOrgMember(membershipId: string): Promise<void> {
    this.store.orgMemberships = this.store.orgMemberships.filter(
      (item) => item.id !== membershipId
    );
  }

  async getOrgMemberById(membershipId: string) {
    return (
      this.store.orgMemberships.find((item) => item.id === membershipId) ?? null
    );
  }

  async ensureTeamInOrg(orgId: string, teamId: string) {
    const team = this.store.teams.find(
      (item) => item.id === teamId && item.orgId === orgId
    );
    return team ?? null;
  }
}

export class InMemoryTeamService {
  constructor(private store: InMemoryStore) {}

  async createTeam(
    orgId: string,
    userId: string,
    teamData: CreateTeamDTO
  ): Promise<Team> {
    const team: Team = {
      id: crypto.randomUUID(),
      orgId,
      name: teamData.name,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.store.teams.push(team);
    return team;
  }

  async getTeamsForOrg(orgId: string): Promise<Team[]> {
    return this.store.teams.filter((team) => team.orgId === orgId);
  }

  async getTeamById(teamId: string): Promise<Team | null> {
    return this.store.teams.find((team) => team.id === teamId) ?? null;
  }

  async updateTeam(teamId: string, teamData: UpdateTeamDTO): Promise<Team> {
    const team = this.store.teams.find((item) => item.id === teamId);
    if (!team) {
      throw new Error("Team not found");
    }
    team.name = teamData.name ?? team.name;
    team.updatedAt = new Date();
    return team;
  }

  async deleteTeam(teamId: string): Promise<void> {
    this.store.teams = this.store.teams.filter((item) => item.id !== teamId);
    this.store.teamMemberships = this.store.teamMemberships.filter(
      (membership) => membership.teamId !== teamId
    );
  }

  async listTeamMembers(teamId: string) {
    return this.store.teamMemberships
      .filter((membership) => membership.teamId === teamId)
      .map((membership) => ({
        ...membership,
        user:
          this.store.users.find((user) => user.id === membership.userId) ??
          null,
      }));
  }

  async addTeamMember(
    teamId: string,
    memberData: AddTeamMemberDTO
  ): Promise<TeamMembership> {
    const existing = this.store.teamMemberships.find(
      (membership) =>
        membership.teamId === teamId && membership.userId === memberData.userId
    );
    if (existing) {
      throw new Error("duplicate membership");
    }

    const membership: TeamMembership = {
      id: crypto.randomUUID(),
      teamId,
      userId: memberData.userId,
      role: memberData.role,
      memberFunction:
        memberData.role === "admin" ? null : memberData.memberFunction ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.store.teamMemberships.push(membership);
    return membership;
  }

  async updateTeamMember(
    membershipId: string,
    memberData: UpdateTeamMemberDTO
  ): Promise<TeamMembership> {
    const membership = this.store.teamMemberships.find(
      (item) => item.id === membershipId
    );
    if (!membership) {
      throw new Error("Team member not found");
    }

    if (memberData.role) {
      membership.role = memberData.role;
    }
    if (memberData.role === "admin") {
      membership.memberFunction = null;
    } else if (memberData.memberFunction !== undefined) {
      membership.memberFunction = memberData.memberFunction;
    }
    membership.updatedAt = new Date();

    return membership;
  }

  async removeTeamMember(membershipId: string): Promise<void> {
    this.store.teamMemberships = this.store.teamMemberships.filter(
      (item) => item.id !== membershipId
    );
  }

  async getTeamMemberById(membershipId: string) {
    return (
      this.store.teamMemberships.find((item) => item.id === membershipId) ??
      null
    );
  }
}

export function createInMemoryStore(seed?: {
  users?: User[];
}): InMemoryStore {
  return {
    users: seed?.users ?? [],
    organizations: [],
    orgMemberships: [],
    teams: [],
    teamMemberships: [],
  };
}
