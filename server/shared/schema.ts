import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);
export const memberFunctionEnum = pgEnum("member_function", [
  "vocalist",
  "bass",
  "piano",
  "guitar",
  "other",
]);
export const teamInviteStatusEnum = pgEnum("team_invite_status", [
  "pending",
  "accepted",
  "declined",
  "expired",
  "revoked",
]);

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  authProviderId: varchar("auth_provider_id").unique(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  orgCode: varchar("org_code").unique(),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orgId: varchar("org_id")
    .notNull()
    .references(() => organizations.id),
  name: varchar("name").notNull(),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orgTeamMemberships = pgTable(
  "org_team_memberships",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orgId: varchar("org_id")
      .notNull()
      .references(() => organizations.id),
    teamId: varchar("team_id")
      .notNull()
      .references(() => teams.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("IDX_org_team_memberships_org_team").on(table.orgId, table.teamId),
  ],
);

export const teamMemberships = pgTable(
  "team_memberships",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    teamId: varchar("team_id")
      .notNull()
      .references(() => teams.id),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    role: userRoleEnum("role").notNull(),
    memberFunction: memberFunctionEnum("member_function"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("IDX_team_memberships_team_user").on(table.teamId, table.userId),
  ],
);

export const teamInvites = pgTable(
  "team_invites",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    teamId: varchar("team_id")
      .notNull()
      .references(() => teams.id),
    email: varchar("email").notNull(),
    role: userRoleEnum("role").notNull(),
    memberFunction: memberFunctionEnum("member_function"),
    message: text("message"),
    tokenHash: varchar("token_hash").notNull(),
    status: teamInviteStatusEnum("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at").notNull(),
    createdBy: varchar("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("IDX_team_invites_team").on(table.teamId),
    index("IDX_team_invites_email").on(table.email),
    index("IDX_team_invites_status").on(table.status),
  ],
);

export const events = pgTable(
  "events",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orgId: varchar("org_id").references(() => organizations.id),
    title: varchar("title").notNull(),
    description: text("description"),
    date: timestamp("date").notNull(),
    createdBy: varchar("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("IDX_events_org_id").on(table.orgId)],
);

export const songs = pgTable(
  "songs",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orgId: varchar("org_id").references(() => organizations.id),
    title: varchar("title").notNull(),
    artist: varchar("artist"),
    key: varchar("key"),
    youtubeUrl: varchar("youtube_url"),
    createdBy: varchar("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("IDX_songs_org_id").on(table.orgId)],
);

export const blockouts = pgTable(
  "blockouts",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orgId: varchar("org_id").references(() => organizations.id),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    reason: varchar("reason"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("IDX_blockouts_org_id").on(table.orgId)],
);

export const eventSongs = pgTable("event_songs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id")
    .notNull()
    .references(() => events.id),
  songId: varchar("song_id")
    .notNull()
    .references(() => songs.id),
  order: varchar("order"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  songs: many(songs),
  blockouts: many(blockouts),
  teamMemberships: many(teamMemberships),
}));

export const organizationsRelations = relations(
  organizations,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [organizations.createdBy],
      references: [users.id],
    }),
    teams: many(teams),
    memberships: many(orgTeamMemberships),
  }),
);

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.orgId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [teams.createdBy],
    references: [users.id],
  }),
  orgTeamMemberships: many(orgTeamMemberships),
  memberships: many(teamMemberships),
}));

export const orgTeamMembershipsRelations = relations(
  orgTeamMemberships,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [orgTeamMemberships.orgId],
      references: [organizations.id],
    }),
    team: one(teams, {
      fields: [orgTeamMemberships.teamId],
      references: [teams.id],
    }),
  }),
);

export const teamMembershipsRelations = relations(
  teamMemberships,
  ({ one }) => ({
    team: one(teams, {
      fields: [teamMemberships.teamId],
      references: [teams.id],
    }),
    user: one(users, {
      fields: [teamMemberships.userId],
      references: [users.id],
    }),
  }),
);

export const eventsRelations = relations(events, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [events.orgId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  eventSongs: many(eventSongs),
}));

export const songsRelations = relations(songs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [songs.orgId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [songs.createdBy],
    references: [users.id],
  }),
  eventSongs: many(eventSongs),
}));

export const blockoutsRelations = relations(blockouts, ({ one }) => ({
  organization: one(organizations, {
    fields: [blockouts.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [blockouts.userId],
    references: [users.id],
  }),
}));

export const eventSongsRelations = relations(eventSongs, ({ one }) => ({
  event: one(events, {
    fields: [eventSongs.eventId],
    references: [events.id],
  }),
  song: one(songs, {
    fields: [eventSongs.songId],
    references: [songs.id],
  }),
}));

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlockoutSchema = createInsertSchema(blockouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSongSchema = createInsertSchema(eventSongs).omit({
  id: true,
  createdAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrgTeamMembershipSchema = createInsertSchema(
  orgTeamMemberships,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMembershipSchema = createInsertSchema(
  teamMemberships,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamInviteSchema = createInsertSchema(teamInvites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type OrgTeamMembership = typeof orgTeamMemberships.$inferSelect;
export type InsertOrgTeamMembership = z.infer<
  typeof insertOrgTeamMembershipSchema
>;
export type TeamMembership = typeof teamMemberships.$inferSelect;
export type InsertTeamMembership = z.infer<typeof insertTeamMembershipSchema>;
export type TeamInvite = typeof teamInvites.$inferSelect;
export type InsertTeamInvite = z.infer<typeof insertTeamInviteSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Song = typeof songs.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Blockout = typeof blockouts.$inferSelect;
export type InsertBlockout = z.infer<typeof insertBlockoutSchema>;
export type EventSong = typeof eventSongs.$inferSelect;
export type InsertEventSong = z.infer<typeof insertEventSongSchema>;
