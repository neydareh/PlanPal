/* global console, process */
import { getDb } from "../src/db";
import {
  orgTeamMemberships,
  organizations,
  songs,
  teamMemberships,
  teams,
  users,
} from "../shared/schema";
import { and, eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting seed process...");

  try {
    const db = getDb();
    const authProviderId = "kp_ebde173e224f482fb0497c6eb7ca76b6";

    // 1. Ensure a user exists to be the creator
    let systemUser = await db.query.users.findFirst({
      where: eq(users.email, "emmanuelneye@gmail.com"),
    });

    if (!systemUser) {
      console.log("Creating system user...");
      const [newUser] = await db
        .insert(users)
        .values({
          authProviderId: authProviderId,
          email: "emmanuelneye@gmail.com",
          firstName: "Olakunle",
          lastName: "Neye",
          role: "admin",
        })
        .returning();
      systemUser = newUser;
    } else if (!systemUser.authProviderId) {
      const [updatedUser] = await db
        .update(users)
        .set({ authProviderId: authProviderId })
        .where(eq(users.id, systemUser.id))
        .returning();
      systemUser = updatedUser;
    }

    // 2. Ensure a default organization and team exist
    const orgName = "ChurchFlow";
    const defaultOrgCode = "org_2914d11498f";
    let organization = await db.query.organizations.findFirst({
      where: eq(organizations.name, orgName),
    });

    if (!organization) {
      console.info("Creating default organization...");
      const [newOrg] = await db
        .insert(organizations)
        .values({
          name: orgName,
          orgCode: defaultOrgCode ?? null,
          createdBy: systemUser.id,
        })
        .returning();
      organization = newOrg;
    } else if (!organization.orgCode && defaultOrgCode) {
      const [updatedOrg] = await db
        .update(organizations)
        .set({ orgCode: defaultOrgCode })
        .where(eq(organizations.id, organization.id))
        .returning();
      organization = updatedOrg;
    }

    const teamName = "Worship Team";
    let team = await db.query.teams.findFirst({
      where: and(eq(teams.orgId, organization.id), eq(teams.name, teamName)),
    });

    if (!team) {
      console.log("Creating default team...");
      const [newTeam] = await db
        .insert(teams)
        .values({
          name: teamName,
          orgId: organization.id,
          createdBy: systemUser.id,
        })
        .returning();
      team = newTeam;
    }

    const existingOrgTeamMembership =
      await db.query.orgTeamMemberships.findFirst({
        where: and(
          eq(orgTeamMemberships.orgId, organization.id),
          eq(orgTeamMemberships.teamId, team.id),
        ),
      });

    if (!existingOrgTeamMembership) {
      await db.insert(orgTeamMemberships).values({
        orgId: organization.id,
        teamId: team.id,
      });
    }

    const existingTeamMembership = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMemberships.teamId, team.id),
        eq(teamMemberships.userId, systemUser.id),
      ),
    });

    if (!existingTeamMembership) {
      await db.insert(teamMemberships).values({
        teamId: team.id,
        userId: systemUser.id,
        role: "admin",
      });
    }

    // 3. Check if songs exist
    const existingSongs = await db.select().from(songs);
    if (existingSongs.length > 0) {
      console.warn("Songs already exist. Skipping song seed.");
      process.exit(0);
    }

    // 4. Insert default songs
    console.info("Seeding songs...");
    const defaultSongs = [
      {
        title: "Way Maker",
        artist: "Sinach",
        key: "E",
        youtubeUrl: "https://www.youtube.com/watch?v=n4XWfwLHeLM",
        orgId: organization.id,
        createdBy: systemUser.id,
      },
      {
        title: "10,000 Reasons (Bless the Lord)",
        artist: "Matt Redman",
        key: "G",
        youtubeUrl: "https://www.youtube.com/watch?v=DXDGE_lRI0E",
        orgId: organization.id,
        createdBy: systemUser.id,
      },
      {
        title: "Oceans (Where Feet May Fail)",
        artist: "Hillsong United",
        key: "D",
        youtubeUrl: "https://www.youtube.com/watch?v=dy9nwe9_xzw",
        orgId: organization.id,
        createdBy: systemUser.id,
      },
      {
        title: "Good Good Father",
        artist: "Chris Tomlin",
        key: "A",
        youtubeUrl: "https://www.youtube.com/watch?v=CqybaIesbuA",
        orgId: organization.id,
        createdBy: systemUser.id,
      },
      {
        title: "What A Beautiful Name",
        artist: "Hillsong Worship",
        key: "D",
        youtubeUrl: "https://www.youtube.com/watch?v=nQWFzMvCfLE",
        orgId: organization.id,
        createdBy: systemUser.id,
      },
    ];

    await db.insert(songs).values(defaultSongs);
    console.log(`✅ Successfully seeded ${defaultSongs.length} songs.`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

void seed();
