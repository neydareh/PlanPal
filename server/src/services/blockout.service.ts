import { eq, sql } from "drizzle-orm";
import { blockouts } from "server/shared/schema";
import { Blockout } from "../interfaces/models";
import { IBlockoutService } from "../interfaces/services";
import { CreateBlockoutDTO } from "../interfaces/dto";
import { db } from "../db";
import { PaginatedResult, paginateResponse } from "../utils/pagination";

export class BlockoutService implements IBlockoutService {
  async getBlockouts(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Blockout>> {

    // Get total count
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(blockouts);
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

    return paginatedResult;
  }

  async getBlockout(id: string): Promise<Blockout | null> {

    const result = await db.query.blockouts.findFirst({
      where: eq(blockouts.id, id),
    });

    return result as Blockout | null;
  }

  async createBlockout(blockoutData: CreateBlockoutDTO): Promise<Blockout> {
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
