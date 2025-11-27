import { Router } from "express";
import { BlockoutController } from "../controllers/blockout.controller";
import { BlockoutService } from "../services/blockout.service";
import { validateRequest } from "../middleware/validation.middleware";
import { CreateBlockoutSchema } from "../interfaces/dto";

const router = Router();
const blockoutService = new BlockoutService();
const blockoutController = new BlockoutController(blockoutService);

router.get("/", (req, res) => {
  return blockoutController.getBlockouts(req, res);
});

router.get("/:id", (req, res) => {
  return blockoutController.getBlockout(req, res);
});

router.post("/", validateRequest(CreateBlockoutSchema), (req, res) =>
  blockoutController.createBlockout(req, res)
);

router.delete("/:id", (req, res) =>
  blockoutController.deleteBlockout(req, res)
);

export const blockoutRoutes = router;
