import { Request, Response } from "express";
import { BlockoutService } from "../services/blockout.service";
import { CreateBlockoutSchema } from "../interfaces/dto";

export class BlockoutController {
  constructor(private blockoutService: BlockoutService) {}

  async getBlockouts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const blockouts = await this.blockoutService.getBlockouts(page, limit);
      res.json(blockouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blockouts" });
    }
  }

  async createBlockout(req: Request, res: Response) {
    try {
      // Validate input using the schema
      const validationResult = CreateBlockoutSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors
        });
      }

      const blockout = await this.blockoutService.createBlockout(validationResult.data);
      
      res.status(201).json(blockout);
    } catch (error) {
      res.status(500).json({ message: "Failed to create blockout" });
    }
  }

  async deleteBlockout(req: Request, res: Response) {
    try {
      await this.blockoutService.deleteBlockout(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blockout" });
    }
  }
}
