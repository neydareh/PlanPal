import { and, eq, sql } from "drizzle-orm";
import { blockouts } from "server/shared/schema";
import { Blockout } from "../interfaces/models";
import { IBlockoutService } from "../interfaces/services";
import { CreateBlockoutDTO } from "../interfaces/dto";
import { getDb } from "../db";
import { PaginatedResult, paginateResponse } from "../utils/pagination";

export class BlockoutService implements IBlockoutService {
  async getBlockouts(
    orgId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Blockout>> {
    const db = getDb();
    const whereConstraint = eq(blockouts.orgId, orgId);

    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(blockouts)
      .where(whereConstraint);
    const total = Number(countResult[0].count);

    const results = await db.query.blockouts.findMany({
      where: whereConstraint,
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

  async getBlockout(orgId: string, id: string): Promise<Blockout | null> {
    const db = getDb();

    const result = await db.query.blockouts.findFirst({
      where: and(eq(blockouts.id, id), eq(blockouts.orgId, orgId)),
    });

    return result as Blockout | null;
  }

  async createBlockout(
    blockoutData: CreateBlockoutDTO & { orgId: string }
  ): Promise<Blockout> {
    const db = getDb();
    const [blockout] = await db
      .insert(blockouts)
      .values({
        orgId: blockoutData.orgId,
        userId: blockoutData.userId,
        startDate: new Date(blockoutData.startDate),
        endDate: new Date(blockoutData.endDate),
        reason: blockoutData.reason ?? null,
      })
      .returning();
    return blockout as Blockout;
  }

  async deleteBlockout(orgId: string, id: string): Promise<void> {
    const db = getDb();
    await db
      .delete(blockouts)
      .where(and(eq(blockouts.id, id), eq(blockouts.orgId, orgId)));
  }
}
