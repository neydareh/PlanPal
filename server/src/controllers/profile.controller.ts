import { NextFunction, Request, Response } from "express";
import { auth0ManagementService } from "../services/auth0-management.service";

type AuthenticatedRequest = Request & {
  auth?: {
    payload?: {
      sub?: string;
    };
  };
};

export class ProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.payload?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const auth0User = await auth0ManagementService.getUserById(userId);

      return res.json(auth0User);
    } catch (error) {
      next(error);
    }
  }
}
