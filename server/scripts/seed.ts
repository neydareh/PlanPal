
import { db } from "../src/db";
import {
  orgMemberships,
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
    // 1. Ensure a user exists to be the creator
    let systemUser = await db.query.users.findFirst({
      where: eq(users.email, "system@churchflow.com"),
    });

    if (!systemUser) {
      console.log("Creating system user...");
      const [newUser] = await db
        .insert(users)
        .values({
          email: "system@churchflow.com",
          firstName: "System",
          lastName: "Admin",
          role: "admin",
        })
        .returning();
      systemUser = newUser;
    }

    console.log(`Using user ID: ${systemUser.id}`);

    // 2. Ensure a default organization and team exist
    const orgName = "ChurchFlow";
    let organization = await db.query.organizations.findFirst({
      where: eq(organizations.name, orgName),
    });

    if (!organization) {
      console.log("Creating default organization...");
      const [newOrg] = await db
        .insert(organizations)
        .values({
          name: orgName,
          createdBy: systemUser.id,
        })
        .returning();
      organization = newOrg;
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

    const existingOrgMembership = await db.query.orgMemberships.findFirst({
      where: and(
        eq(orgMemberships.orgId, organization.id),
        eq(orgMemberships.userId, systemUser.id)
      ),
    });

    if (!existingOrgMembership) {
      await db.insert(orgMemberships).values({
        orgId: organization.id,
        userId: systemUser.id,
        role: "admin",
      });
    }

    const existingTeamMembership = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMemberships.teamId, team.id),
        eq(teamMemberships.userId, systemUser.id)
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
      console.log("Songs already exist. Skipping song seed.");
      process.exit(0);
    }

    // 4. Insert default songs
    console.log("Seeding songs...");
    const defaultSongs = [
      {
        title: "Way Maker",
        artist: "Sinach",
        key: "E",
        youtubeUrl: "https://www.youtube.com/watch?v=n4XWfwLHeLM",
        createdBy: systemUser.id,
      },
      {
        title: "10,000 Reasons (Bless the Lord)",
        artist: "Matt Redman",
        key: "G",
        youtubeUrl: "https://www.youtube.com/watch?v=DXDGE_lRI0E",
        createdBy: systemUser.id,
      },
      {
        title: "Oceans (Where Feet May Fail)",
        artist: "Hillsong United",
        key: "D",
        youtubeUrl: "https://www.youtube.com/watch?v=dy9nwe9_xzw",
        createdBy: systemUser.id,
      },
      {
        title: "Good Good Father",
        artist: "Chris Tomlin",
        key: "A",
        youtubeUrl: "https://www.youtube.com/watch?v=CqybaIesbuA",
        createdBy: systemUser.id,
      },
      {
        title: "What A Beautiful Name",
        artist: "Hillsong Worship",
        key: "D",
        youtubeUrl: "https://www.youtube.com/watch?v=nQWFzMvCfLE",
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
