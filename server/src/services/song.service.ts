import { and, eq, sql } from "drizzle-orm";
import { songs } from "server/shared/schema";
import { Song } from "../interfaces/models";
import { ISongService } from "../interfaces/services";
import { getDb } from "../db";
import { CacheService } from "../utils/cache";
import { PaginatedResult, paginateResponse } from "../utils/pagination";
import { CreateSongDTO } from "@server/interfaces/dto";

export class SongService implements ISongService {
  async getSongs(
    orgId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Song>> {
    const db = getDb();
    // const cacheKey = `songs:${orgId}:page:${page}:limit:${limit}`;

    // Try to get from cache
    // const cached = await CacheService.get<PaginatedResult<Song>>(cacheKey);
    // if (cached) {
    //   return cached;
    // }

    // Get total count
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(songs)
      .where(eq(songs.orgId, orgId));
    const total = Number(countResult[0].count);

    // Get paginated results
    const results = await db.query.songs.findMany({
      where: eq(songs.orgId, orgId),
      limit,
      offset: (page - 1) * limit,
      orderBy: (songs, { desc }) => [desc(songs.createdAt)],
    });

    const paginatedResult = paginateResponse(results as Song[], total, {
      page,
      limit,
      offset: (page - 1) * limit,
    });

    // Cache the results
    // await CacheService.set(cacheKey, paginatedResult, 300); // Cache for 5 minutes

    return paginatedResult;
  }

  async createSong(
    songData: CreateSongDTO & { createdBy: string; orgId: string }
  ): Promise<Song> {
    const db = getDb();
    const [song] = await db
      .insert(songs)
      .values({
        orgId: songData.orgId,
        title: songData.title,
        artist: songData.artist,
        key: songData.key,
        createdBy: songData.createdBy,
        youtubeUrl: songData.youtubeUrl || null,
      })
      .returning();
    return song as Song;
  }

  async updateSong(
    orgId: string,
    id: string,
    songData: Partial<Song>
  ): Promise<Song> {
    const db = getDb();
    const updateData = {
      ...songData,
      updatedAt: new Date(),
    };

    const [song] = await db
      .update(songs)
      .set(updateData)
      .where(and(eq(songs.id, id), eq(songs.orgId, orgId)))
      .returning();
    return song as Song;
  }

  async deleteSong(orgId: string, id: string): Promise<void> {
    const db = getDb();
    await db.delete(songs).where(and(eq(songs.id, id), eq(songs.orgId, orgId)));
  }
}
