import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { UpdateUserDTO } from "../interfaces/dto";

export class UserController {
  constructor(private userService: UserService) {}

  async getUsers(_req: Request, res: Response) {
    try {
      const users = await this.userService.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const user = await this.userService.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userData = req.body as UpdateUserDTO;
      const user = await this.userService.updateUser(req.params.id, userData);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const user = await this.userService.getUserByEmail(req.body.email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current user" });
    }
  }
}
