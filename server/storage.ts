import { db } from "./db";
import { users, events, songs, blockouts, eventSongs } from "@shared/schema";
import type {
  UpsertUser,
  User,
  Event,
  InsertEvent,
  Song,
  InsertSong,
  Blockout,
  InsertBlockout,
  EventSong,
  InsertEventSong,
} from "@shared/schema";
import { eq, asc, and, sql } from "drizzle-orm";

export class Storage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.firstName));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: UpsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<UpsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(asc(events.date));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getSongs(): Promise<Song[]> {
    return await db.select().from(songs).orderBy(asc(songs.title));
  }

  async getSong(id: string): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song;
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [newSong] = await db.insert(songs).values(song).returning();
    return newSong;
  }

  async updateSong(id: string, song: Partial<InsertSong>): Promise<Song> {
    const [updatedSong] = await db
      .update(songs)
      .set({ ...song, updatedAt: new Date() })
      .where(eq(songs.id, id))
      .returning();
    return updatedSong;
  }

  async deleteSong(id: string): Promise<void> {
    await db.delete(songs).where(eq(songs.id, id));
  }

  async searchSongs(query?: string, key?: string): Promise<Song[]> {
    const conditions = [];

    if (query) {
      conditions.push(
        sql`LOWER(${songs.title}) LIKE LOWER('%' || ${query} || '%') OR LOWER(${songs.artist}) LIKE LOWER('%' || ${query} || '%')`
      );
    }
    if (key) {
      conditions.push(eq(songs.key, key));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(songs)
        .where(and(...conditions))
        .orderBy(asc(songs.title));
    }

    return await db.select().from(songs).orderBy(asc(songs.title));
  }

  async getBlockouts(): Promise<Blockout[]> {
    return await db.select().from(blockouts).orderBy(asc(blockouts.startDate));
  }

  async getBlockout(id: string): Promise<Blockout | undefined> {
    const [blockout] = await db
      .select()
      .from(blockouts)
      .where(eq(blockouts.id, id));
    return blockout;
  }

  async createBlockout(blockout: InsertBlockout): Promise<Blockout> {
    const [newBlockout] = await db
      .insert(blockouts)
      .values(blockout)
      .returning();
    return newBlockout;
  }

  async updateBlockout(
    id: string,
    blockout: Partial<InsertBlockout>
  ): Promise<Blockout> {
    const [updatedBlockout] = await db
      .update(blockouts)
      .set({ ...blockout, updatedAt: new Date() })
      .where(eq(blockouts.id, id))
      .returning();
    return updatedBlockout;
  }

  async deleteBlockout(id: string): Promise<void> {
    await db.delete(blockouts).where(eq(blockouts.id, id));
  }

  async getEventSongs(eventId: string): Promise<EventSong[]> {
    return await db
      .select()
      .from(eventSongs)
      .where(eq(eventSongs.eventId, eventId));
  }

  async addEventSong(eventSong: InsertEventSong): Promise<EventSong> {
    const [newEventSong] = await db
      .insert(eventSongs)
      .values(eventSong)
      .returning();
    return newEventSong;
  }

  async removeEventSong(eventId: string, songId: string): Promise<void> {
    await db
      .delete(eventSongs)
      .where(
        and(eq(eventSongs.eventId, eventId), eq(eventSongs.songId, songId))
      );
  }
}

export const storage = new Storage();
