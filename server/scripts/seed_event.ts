
import { db } from "../src/db";
import { users, events, blockouts } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedEventAndBlockout() {
  console.log("🌱 Starting event and blockout seed process...");

  try {
    // 1. Create or get User "Olakunle"
    let user = await db.query.users.findFirst({
      where: eq(users.email, "olakunle@churchflow.com"),
    });

    if (!user) {
      console.log("Creating user Olakunle...");
      const [newUser] = await db
        .insert(users)
        .values({
          email: "olakunle@churchflow.com",
          firstName: "Olakunle",
          lastName: "Neye", // Assuming last name based on context
          role: "user",
        })
        .returning();
      user = newUser;
    }
    console.log(`Using user ID: ${user.id}`);

    // 2. Create Event "Sunday Service" for Nov 23, 2025
    const eventDate = new Date("2025-11-23T09:00:00"); // 9 AM
    console.log(`Creating event for date: ${eventDate.toISOString()}`);

    const [newEvent] = await db
      .insert(events)
      .values({
        title: "Sunday Service",
        description: "Regular Sunday Worship Service",
        date: eventDate,
        createdBy: user.id, // Olakunle created it
      })
      .returning();
    console.log(`✅ Created event: ${newEvent.title} on ${newEvent.date}`);

    // 3. Create Blockout for Olakunle on Nov 23, 2025
    // Blockout for the whole day or specific time? Let's do whole day for visibility
    const blockoutStart = new Date("2025-11-23T00:00:00");
    const blockoutEnd = new Date("2025-11-30T23:59:59");

    const [newBlockout] = await db
      .insert(blockouts)
      .values({
        userId: user.id,
        startDate: blockoutStart,
        endDate: blockoutEnd,
        reason: "Away",
      })
      .returning();
    console.log(`✅ Created blockout for ${user.firstName} from ${newBlockout.startDate} to ${newBlockout.endDate}`);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedEventAndBlockout();
