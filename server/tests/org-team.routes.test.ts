import express from "express";
import request from "supertest";
import crypto from "node:crypto";
import { createOrgRoutes } from "../src/routes/org.routes";
import { createTeamRoutes } from "../src/routes/team.routes";
import {
  createInMemoryStore,
  InMemoryOrgService,
  InMemoryTeamService,
} from "./support/in-memory-services";

type TestUser = {
  id: string;
  email: string;
};

describe("Org/Team API flows", function () {
  this.timeout(30000);

  let app: express.Express;
  let primaryUser: TestUser;
  let secondaryUser: TestUser;
  let createdOrgId = "";
  let createdTeamId = "";
  let createdTeamMemberId = "";
  let createdOrgMemberId = "";

  before(async () => {
    const primaryEmail = `org-test-${crypto.randomUUID()}@example.com`;
    const secondaryEmail = `org-test-${crypto.randomUUID()}@example.com`;

    const store = createInMemoryStore({
      users: [
        {
          id: crypto.randomUUID(),
          email: primaryEmail,
          firstName: "Test",
          lastName: "Admin",
          profileImageUrl: null,
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          email: secondaryEmail,
          firstName: "Test",
          lastName: "Member",
          profileImageUrl: null,
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    primaryUser = { id: store.users[0].id, email: primaryEmail };
    secondaryUser = { id: store.users[1].id, email: secondaryEmail };

    const orgService = new InMemoryOrgService(store);
    const teamService = new InMemoryTeamService(store);

    app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      const headerUserId = req.header("x-test-user");
      (req as any).user = {
        sub: headerUserId ?? primaryUser.id,
      };
      next();
    });

    const noAuth = {
      requireOrgAdmin: () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
      requireOrgMember: () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
    };

    app.use("/api/orgs", createOrgRoutes(orgService, noAuth));
    app.use("/api/orgs", createTeamRoutes(teamService, orgService, noAuth));
  });

  after(async () => {
    createdTeamMemberId = "";
    createdOrgMemberId = "";
    createdTeamId = "";
    createdOrgId = "";
  });

  it("creates orgs, teams, and manages memberships", async () => {
    const orgResponse = await request(app)
      .post("/api/orgs")
      .send({ name: "Test Org" })
      .expect(201);

    createdOrgId = orgResponse.body.id;

    const orgListResponse = await request(app).get("/api/orgs").expect(200);
    const orgListIds = orgListResponse.body.map((org: any) => org.id);
    if (!orgListIds.includes(createdOrgId)) {
      throw new Error("Expected org list to include created org");
    }

    const teamResponse = await request(app)
      .post(`/api/orgs/${createdOrgId}/teams`)
      .send({ name: "Worship Team" })
      .expect(201);

    createdTeamId = teamResponse.body.id;

    const orgMemberResponse = await request(app)
      .post(`/api/orgs/${createdOrgId}/members`)
      .send({ userId: secondaryUser.id, role: "member" })
      .expect(201);

    createdOrgMemberId = orgMemberResponse.body.id;

    const orgMembersResponse = await request(app)
      .get(`/api/orgs/${createdOrgId}/members`)
      .expect(200);
    const orgMemberIds = orgMembersResponse.body.map((member: any) => member.id);
    if (!orgMemberIds.includes(createdOrgMemberId)) {
      throw new Error("Expected org member list to include created member");
    }

    const teamMemberResponse = await request(app)
      .post(`/api/orgs/${createdOrgId}/teams/${createdTeamId}/members`)
      .send({
        userId: secondaryUser.id,
        role: "member",
        memberFunction: "vocalist",
      })
      .expect(201);

    createdTeamMemberId = teamMemberResponse.body.id;

    await request(app)
      .patch(
        `/api/orgs/${createdOrgId}/teams/${createdTeamId}/members/${createdTeamMemberId}`
      )
      .send({ role: "admin" })
      .expect(200);

    const teamMembersResponse = await request(app)
      .get(`/api/orgs/${createdOrgId}/teams/${createdTeamId}/members`)
      .expect(200);
    const teamMemberIds = teamMembersResponse.body.map(
      (member: any) => member.id
    );
    if (!teamMemberIds.includes(createdTeamMemberId)) {
      throw new Error("Expected team member list to include created member");
    }
  });
});
