import {
  users,
  events,
  songs,
  blockouts,
  eventSongs,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type Song,
  type InsertSong,
  type Blockout,
  type InsertBlockout,
  type EventSong,
  type InsertEventSong,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]>;
  
  // Song operations
  getSongs(): Promise<Song[]>;
  getSong(id: string): Promise<Song | undefined>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: string, song: Partial<InsertSong>): Promise<Song>;
  deleteSong(id: string): Promise<void>;
  searchSongs(query?: string, key?: string): Promise<Song[]>;
  
  // Blockout operations
  getBlockouts(): Promise<Blockout[]>;
  getBlockoutsByUser(userId: string): Promise<Blockout[]>;
  getBlockoutsByDateRange(startDate: Date, endDate: Date): Promise<Blockout[]>;
  createBlockout(blockout: InsertBlockout): Promise<Blockout>;
  updateBlockout(id: string, blockout: Partial<InsertBlockout>): Promise<Blockout>;
  deleteBlockout(id: string): Promise<void>;
  
  // Event-Song operations
  getEventSongs(eventId: string): Promise<(EventSong & { song: Song })[]>;
  addSongToEvent(eventSong: InsertEventSong): Promise<EventSong>;
  removeSongFromEvent(eventId: string, songId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.date));
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

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(and(gte(events.date, startDate), lte(events.date, endDate)))
      .orderBy(asc(events.date));
  }

  // Song operations
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
    let queryBuilder = db.select().from(songs);
    
    // Add filters based on parameters
    const conditions = [];
    if (query) {
      conditions.push(
        // SQL function for case-insensitive search
        sql`LOWER(${songs.title}) LIKE LOWER('%' || ${query} || '%') OR LOWER(${songs.artist}) LIKE LOWER('%' || ${query} || '%')`
      );
    }
    if (key) {
      conditions.push(eq(songs.key, key));
    }
    
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions));
    }
    
    return await queryBuilder.orderBy(asc(songs.title));
  }

  // Blockout operations
  async getBlockouts(): Promise<Blockout[]> {
    return await db.select().from(blockouts).orderBy(desc(blockouts.startDate));
  }

  async getBlockoutsByUser(userId: string): Promise<Blockout[]> {
    return await db
      .select()
      .from(blockouts)
      .where(eq(blockouts.userId, userId))
      .orderBy(desc(blockouts.startDate));
  }

  async getBlockoutsByDateRange(startDate: Date, endDate: Date): Promise<Blockout[]> {
    return await db
      .select()
      .from(blockouts)
      .where(
        and(
          lte(blockouts.startDate, endDate),
          gte(blockouts.endDate, startDate)
        )
      )
      .orderBy(asc(blockouts.startDate));
  }

  async createBlockout(blockout: InsertBlockout): Promise<Blockout> {
    const [newBlockout] = await db.insert(blockouts).values(blockout).returning();
    return newBlockout;
  }

  async updateBlockout(id: string, blockout: Partial<InsertBlockout>): Promise<Blockout> {
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

  // Event-Song operations
  async getEventSongs(eventId: string): Promise<(EventSong & { song: Song })[]> {
    return await db
      .select({
        id: eventSongs.id,
        eventId: eventSongs.eventId,
        songId: eventSongs.songId,
        order: eventSongs.order,
        createdAt: eventSongs.createdAt,
        song: songs,
      })
      .from(eventSongs)
      .innerJoin(songs, eq(eventSongs.songId, songs.id))
      .where(eq(eventSongs.eventId, eventId))
      .orderBy(asc(eventSongs.order));
  }

  async addSongToEvent(eventSong: InsertEventSong): Promise<EventSong> {
    const [newEventSong] = await db.insert(eventSongs).values(eventSong).returning();
    return newEventSong;
  }

  async removeSongFromEvent(eventId: string, songId: string): Promise<void> {
    await db
      .delete(eventSongs)
      .where(and(eq(eventSongs.eventId, eventId), eq(eventSongs.songId, songId)));
  }
}

export const storage = new DatabaseStorage();
