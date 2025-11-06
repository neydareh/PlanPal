import { NextFunction, Request, Response } from "express";
import { auth0ManagementService } from "../services/auth0-management.service";
import { UserService } from "@server/services/user.service";

type AuthenticatedRequest = Request & {
  auth?: {
    payload?: {
      sub?: string;
    };
  };
};

export class ProfileController {
  constructor(private userService: UserService) {}
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.payload?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const response = await auth0ManagementService.getUserById(userId);
      const userInfo = response.data;
      if (!userInfo) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = await this.userService.getUserByEmail(userInfo.email);

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}
