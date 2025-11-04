import { SongController } from "@server/controllers/song.controller";
import { SongService } from "@server/services/song.service";
import { Router } from "express";

const router = Router();
const songService = new SongService();
const songController = new SongController(songService);

router.get("/", (req, res) => songController.getSongs(req, res));
router.post("/", (req, res) => songController.createSong(req, res));
router.put("/:id", (req, res) => songController.updateSong(req, res));
router.delete("/:id", (req, res) => songController.deleteSong(req, res));

export const songRoutes = router;
