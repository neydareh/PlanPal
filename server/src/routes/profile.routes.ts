import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";

const router = Router();
const profileController = new ProfileController();

router.get("/", (req, res, next) => profileController.getProfile(req, res, next));

export const profileRoutes = router;
