import { and, eq, sql } from "drizzle-orm";
import { events, eventSongs, songs } from "server/shared/schema";
import { Event } from "../interfaces/models";
import { IEventService } from "../interfaces/services";
import { CreateEventDTO, UpdateEventDTO } from "../interfaces/dto";
import { PaginatedResult, paginateResponse } from "../utils/pagination";
import { getDb } from "../db";

export class EventService implements IEventService {
  async getEvents(
    orgId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Event>> {
    const db = getDb();
    // const cacheKey = `events:page:${page}:limit:${limit}`;

    // // Try to get from cache
    // const cached = await CacheService.get<PaginatedResult<Event>>(cacheKey);
    // if (cached) {
    //   return cached;
    // }

    // Get total count
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(events)
      .where(eq(events.orgId, orgId));
    const total = Number(countResult[0].count);

    // Get paginated results
    const results = await db.query.events.findMany({
      where: eq(events.orgId, orgId),
      limit,
      offset: (page - 1) * limit,
      orderBy: (events, { desc }) => [desc(events.createdAt)],
    });

    const paginatedResult = paginateResponse(results as Event[], total, {
      page,
      limit,
      offset: (page - 1) * limit,
    });

    // Cache the results
    // await CacheService.set(cacheKey, paginatedResult, 300); // Cache for 5 minutes

    return paginatedResult;
  }

  async getEvent(orgId: string, id: string): Promise<Event | null> {
    const db = getDb();
    const cacheKey = `event:${id}`;

    // Try to get from cache
    // const cached = await CacheService.get<Event>(cacheKey);
    // if (cached) {
    //   return cached;
    // }

    const result = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.orgId, orgId)),
    });

    if (result) {
      // Cache the result
      // await CacheService.set(cacheKey, result, 300); // Cache for 5 minutes
    }

    return result as Event | null;
  }

  async createEvent(
    eventData: CreateEventDTO & { createdBy: string; orgId: string }
  ): Promise<Event> {
    const db = getDb();
    const [event] = await db
      .insert(events)
      .values({
        title: eventData.title,
        description: eventData.description ?? null,
        date: new Date(eventData.date),
        orgId: eventData.orgId,
        createdBy: eventData.createdBy,
      })
      .returning();
    return event as Event;
  }

  async updateEvent(
    orgId: string,
    id: string,
    eventData: UpdateEventDTO
  ): Promise<Event> {
    const db = getDb();
    const { date, ...rest } = eventData;
    const updateData = {
      ...rest,
      updatedAt: new Date(),
      ...(date ? { date: new Date(date) } : {}),
    };

    const [event] = await db
      .update(events)
      .set(updateData)
      .where(and(eq(events.id, id), eq(events.orgId, orgId)))
      .returning();
    return event as Event;
  }

  async deleteEvent(orgId: string, id: string): Promise<void> {
    const db = getDb();
    await db.delete(events).where(and(eq(events.id, id), eq(events.orgId, orgId)));
  }

  async getEventSongs(orgId: string, id: string) {
    const db = getDb();
    const result = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.orgId, orgId)),
      with: {
        eventSongs: {
          with: {
            song: true,
          },
          orderBy: (eventSongs, { asc }) => [asc(eventSongs.order)],
        },
      },
    });

    if (!result) return [];

    return result.eventSongs.map((eventSong) => ({
      ...eventSong.song,
      order: eventSong.order,
    }));
  }

  async addEventSong(
    orgId: string,
    eventId: string,
    songId: string,
    order: string
  ) {
    const db = getDb();
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.orgId, orgId)),
    });

    if (!event) {
      throw new Error("event not found");
    }

    const song = await db.query.songs.findFirst({
      where: and(eq(songs.id, songId), eq(songs.orgId, orgId)),
    });

    if (!song) {
      throw new Error("song not found");
    }

    const [eventSong] = await db
      .insert(eventSongs)
      .values({
        eventId,
        songId,
        order,
      })
      .returning();
    return eventSong;
  }
}
