
import { db } from "../src/db";
import { songs, users } from "../shared/schema";
import { eq } from "drizzle-orm";

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

    // 2. Check if songs exist
    const existingSongs = await db.select().from(songs);
    if (existingSongs.length > 0) {
      console.log("Songs already exist. Skipping seed.");
      process.exit(0);
    }

    // 3. Insert default songs
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

seed();
