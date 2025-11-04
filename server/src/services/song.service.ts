import { eq, sql } from "drizzle-orm";
import { songs } from "server/shared/schema";
import { Song } from "../interfaces/models";
import { ISongService } from "../interfaces/services";
import { db } from "../db";
import { CacheService } from "../utils/cache";
import { PaginatedResult, paginateResponse } from "../utils/pagination";
import { CreateSongDTO } from "@server/interfaces/dto";

export class SongService implements ISongService {
  async getSongs(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Song>> {
    const cacheKey = `songs:page:${page}:limit:${limit}`;

    // Try to get from cache
    const cached = await CacheService.get<PaginatedResult<Song>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get total count
    const countResult = await db.select({ count: sql`count(*)` }).from(songs);
    const total = Number(countResult[0].count);

    // Get paginated results
    const results = await db.query.songs.findMany({
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
    await CacheService.set(cacheKey, paginatedResult, 300); // Cache for 5 minutes

    return paginatedResult;
  }

  async createSong(
    songData: CreateSongDTO & { createdBy: string }
  ): Promise<Song> {
    const [song] = await db
      .insert(songs)
      .values({
        title: songData.title,
        artist: songData.artist,
        key: songData.key,
        createdBy: songData.createdBy,
        youtubeUrl: songData.youtubeUrl || null,
      })
      .returning();
    return song as Song;
  }

  async updateSong(id: string, songData: Partial<Song>): Promise<Song> {
    const updateData: any = {
      ...songData,
      updatedAt: new Date(),
    };

    const [song] = await db
      .update(songs)
      .set(updateData)
      .where(eq(songs.id, id))
      .returning();
    return song as Song;
  }

  async deleteSong(id: string): Promise<void> {
    await db.delete(songs).where(eq(songs.id, id));
  }
}
