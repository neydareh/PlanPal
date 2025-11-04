import { Router } from "express";
import { healthCheck, readinessCheck } from "../controllers/health.controller";

const router = Router();

router.get("/", (req, res) => healthCheck(req, res));
router.get("/readiness", (req, res) => readinessCheck(req, res));
export const healthRoutes = router;
