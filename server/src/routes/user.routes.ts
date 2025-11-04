import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

router.get("/current", (req, res) => userController.getCurrentUser(req, res));
router.get("/", (req, res) => userController.getUsers(req, res));
router.get("/:id", (req, res) => userController.getUser(req, res));
router.put("/:id", (req, res) => userController.updateUser(req, res));

export const userRoutes = router;
