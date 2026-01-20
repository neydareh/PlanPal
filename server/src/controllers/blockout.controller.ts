import { Request, Response } from "express";
import { BlockoutService } from "../services/blockout.service";
import { CreateBlockoutSchema } from "../interfaces/dto";
import { getOrgIdFromRequest } from "../utils/org-id";

export class BlockoutController {
  constructor(private blockoutService: BlockoutService) {}

  async getBlockouts(req: Request, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);
      if (!orgId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const blockouts = await this.blockoutService.getBlockouts(
        orgId,
        page,
        limit
      );
      res.json(blockouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blockouts" });
    }
  }

  async getBlockout(req: Request, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);
      if (!orgId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }

      const blockout = await this.blockoutService.getBlockout(
        orgId,
        req.params.id
      );
      if (!blockout) {
        return res.status(404).json({ message: "Blockout not found" });
      }
      res.json(blockout);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blockout" });
    }
  }

  async createBlockout(req: Request, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);
      if (!orgId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }

      // Validate input using the schema
      const validationResult = CreateBlockoutSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors
        });
      }

      const blockout = await this.blockoutService.createBlockout({
        ...validationResult.data,
        orgId,
      });
      
      res.status(201).json(blockout);
    } catch (error) {
      res.status(500).json({ message: "Failed to create blockout" });
    }
  }

  async deleteBlockout(req: Request, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);
      if (!orgId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }

      await this.blockoutService.deleteBlockout(orgId, req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blockout" });
    }
  }
}
