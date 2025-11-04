import { Request, Response, NextFunction } from "express";
import { userRoleEnum } from "server/shared/schema";
import { UserService } from "../services/user.service";
type UserRole = (typeof userRoleEnum.enumValues)[number];

export function requireRoles(roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.sub;
      const userService = new UserService();
      const user = await userService.getUser(userId);

      if (!user) {
        return res.status(401).json({
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          message: "Insufficient permissions",
          code: "FORBIDDEN",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        message: "Error checking permissions",
        code: "AUTH_ERROR",
      });
    }
  };
}

// Helper middleware for common role checks
export const requireAdmin = requireRoles(["admin"]);
export const requireUser = requireRoles(["user"]);
