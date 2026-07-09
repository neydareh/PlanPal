
/* global console, process */
import { getDb } from "../src/db";
import { users, events, blockouts, organizations } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedEventAndBlockout() {
  console.log("🌱 Starting event and blockout seed process...");

  try {
    const db = getDb();
    const authProviderId = "kp_ebde173e224f482fb0497c6eb7ca76b6"
    // 1. Create or get User "Olakunle"
    let user = await db.query.users.findFirst({
      where: eq(users.email, "emmanuelneye@gmail.com"),
    });

    if (!user) {
      console.log("Creating user Olakunle...");
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
      user = newUser;
    } else if (!user.authProviderId) {
      const [updatedUser] = await db
        .update(users)
        .set({ authProviderId: authProviderId })
        .where(eq(users.id, user.id))
        .returning();
      user = updatedUser;
    }
    console.log(`Using user ID: ${user.id}`);

    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.name, "ChurchFlow"),
    });

    if (!organization) {
      console.log("No default organization found. Skipping event seed.");
      process.exit(0);
    }

    // 2. Create Event "Sunday Service"
    const eventDate = new Date("2026-01-20T09:00:00");
    console.log(`Creating event for date: ${eventDate.toISOString()}`);

    const [newEvent] = await db
      .insert(events)
      .values({
        title: "Sunday Service",
        description: "Regular Sunday Worship Service",
        date: eventDate,
        orgId: organization.id,
        createdBy: user.id,
      })
      .returning();
    console.log(`✅ Created event: ${newEvent.title} on ${newEvent.date}`);

    // 3. Create Blockout
    const blockoutStart = new Date("2026-01-01T00:00:00");
    const blockoutEnd = new Date("2026-01-30T23:59:59");

    const [newBlockout] = await db
      .insert(blockouts)
      .values({
        orgId: organization.id,
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

void seedEventAndBlockout();
