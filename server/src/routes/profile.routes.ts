import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { UserService } from "@server/services/user.service";

const router = Router();
const userService = new UserService();
const profileController = new ProfileController(userService);

router.get("/", (req, res, next) => profileController.getProfile(req, res, next));

export const profileRoutes = router;
