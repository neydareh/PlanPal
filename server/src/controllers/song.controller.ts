import { SongService } from "@server/services/song.service";
import { Request, Response } from "express";
import { CreateSongSchema } from "@server/interfaces/dto";

export class SongController {
  constructor(private songService: SongService) {}

  async getSongs(req: Request, res: Response) {
    try {
      const songs = await this.songService.getSongs();
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  }

  async createSong(req: Request & { user?: unknown }, res: Response) {
    try {
      // Validate input using the schema
      const validationResult = CreateSongSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors
        });
      }

      const song = await this.songService.createSong({
        ...validationResult.data,
        createdBy: validationResult.data.createdBy,
      });
      
      res.status(201).json(song);
    } catch (error) {
      // Handle specific error types
      if (error instanceof Error) {
        console.error("Song creation error:", error);
        if (error.message.includes("duplicate")) {
          return res.status(409).json({ message: "Song already exists" });
        }
        if (error.message.includes("foreign key")) {
          return res.status(400).json({ message: "Invalid user reference" });
        }
      }
      res.status(500).json({ message: "Failed to create song" });
    }
  }

  async updateSong(req: Request, res: Response) {
    try {
      const song = await this.songService.updateSong(req.params.id, req.body);
      res.json(song);
    } catch (error) {
      res.status(500).json({ message: "Failed to update song" });
    }
  }

  async deleteSong(req: Request, res: Response) {
    try {
      await this.songService.deleteSong(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete song" });
    }
  }
}
