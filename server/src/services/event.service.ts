import { eq, sql } from "drizzle-orm";
import { events, eventSongs } from "server/shared/schema";
import { Event } from "../interfaces/models";
import { IEventService } from "../interfaces/services";
import { CreateEventDTO, UpdateEventDTO } from "../interfaces/dto";
import { CacheService } from "../utils/cache";
import { PaginatedResult, paginateResponse } from "../utils/pagination";
import { db } from "../db";

export class EventService implements IEventService {
  async getEvents(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Event>> {
    // const cacheKey = `events:page:${page}:limit:${limit}`;

    // // Try to get from cache
    // const cached = await CacheService.get<PaginatedResult<Event>>(cacheKey);
    // if (cached) {
    //   return cached;
    // }

    // Get total count
    const countResult = await db.select({ count: sql`count(*)` }).from(events);
    const total = Number(countResult[0].count);

    // Get paginated results
    const results = await db.query.events.findMany({
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

  async getEvent(id: string): Promise<Event | null> {
    const cacheKey = `event:${id}`;

    // Try to get from cache
    // const cached = await CacheService.get<Event>(cacheKey);
    // if (cached) {
    //   return cached;
    // }

    const result = await db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (result) {
      // Cache the result
      // await CacheService.set(cacheKey, result, 300); // Cache for 5 minutes
    }

    return result as Event | null;
  }

  async createEvent(
    eventData: CreateEventDTO & { createdBy: string }
  ): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({
        title: eventData.title,
        description: eventData.description ?? null,
        date: new Date(eventData.date),
        createdBy: eventData.createdBy,
      })
      .returning();
    return event as Event;
  }

  async updateEvent(id: string, eventData: UpdateEventDTO): Promise<Event> {
    const { date, ...rest } = eventData;
    const updateData = {
      ...rest,
      updatedAt: new Date(),
      ...(date ? { date: new Date(date) } : {}),
    };

    const [event] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();
    return event as Event;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getEventSongs(id: string) {
    const result = await db.query.events.findFirst({
      where: eq(events.id, id),
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

  async addEventSong(eventId: string, songId: string, order: string) {
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
