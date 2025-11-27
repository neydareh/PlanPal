import { eq, sql } from "drizzle-orm";
import { blockouts } from "server/shared/schema";
import { Blockout } from "../interfaces/models";
import { IBlockoutService } from "../interfaces/services";
import { CreateBlockoutDTO } from "../interfaces/dto";
import { db } from "../db";
import { CacheService } from "../utils/cache";
import { PaginatedResult, paginateResponse } from "../utils/pagination";

export class BlockoutService implements IBlockoutService {
  async getBlockouts(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Blockout>> {
    const cacheKey = `blockouts:page:${page}:limit:${limit}`;

    // Try to get from cache
    const cached = await CacheService.get<PaginatedResult<Blockout>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get total count
    const countResult = await db.select({ count: sql`count(*)` }).from(blockouts);
    const total = Number(countResult[0].count);

    // Get paginated results
    const results = await db.query.blockouts.findMany({
      limit,
      offset: (page - 1) * limit,
      orderBy: (blockouts, { desc }) => [desc(blockouts.startDate)],
    });

    const paginatedResult = paginateResponse(results as Blockout[], total, {
      page,
      limit,
      offset: (page - 1) * limit,
    });

    // Cache the results
    await CacheService.set(cacheKey, paginatedResult, 300); // Cache for 5 minutes

    return paginatedResult;
  }

  async createBlockout(
    blockoutData: CreateBlockoutDTO
  ): Promise<Blockout> {
    const [blockout] = await db
      .insert(blockouts)
      .values({
        userId: blockoutData.userId,
        startDate: new Date(blockoutData.startDate),
        endDate: new Date(blockoutData.endDate),
        reason: blockoutData.reason || null,
      })
      .returning();
    return blockout as Blockout;
  }

  async deleteBlockout(id: string): Promise<void> {
    await db.delete(blockouts).where(eq(blockouts.id, id));
  }
}
