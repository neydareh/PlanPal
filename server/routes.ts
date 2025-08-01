import { Express } from "express";
import { setupAuth, isAuthenticated } from "./auth0";
import { storage } from "./storage";

export function registerRoutes(app: Express) {
  setupAuth(app);

  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/events", isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      const event = await storage.createEvent({
        ...req.body,
        createdBy: sessionUser.sub,
      });
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.get("/api/songs", isAuthenticated, async (req, res) => {
    try {
      const { query, key } = req.query;
      const songs = await storage.searchSongs(query as string, key as string);
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  });

  app.post("/api/songs", isAuthenticated, async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      const song = await storage.createSong({
        ...req.body,
        createdBy: sessionUser.sub,
      });
      res.json(song);
    } catch (error) {
      res.status(500).json({ message: "Failed to create song" });
    }
  });

  app.put("/api/songs/:id", isAuthenticated, async (req, res) => {
    try {
      const song = await storage.updateSong(req.params.id, req.body);
      res.json(song);
    } catch (error) {
      res.status(500).json({ message: "Failed to update song" });
    }
  });

  app.delete("/api/songs/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSong(req.params.id);
      res.json({ message: "Song deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete song" });
    }
  });

  app.get("/api/blockouts", isAuthenticated, async (req, res) => {
    try {
      const blockouts = await storage.getBlockouts();
      res.json(blockouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blockouts" });
    }
  });

  app.post("/api/blockouts", isAuthenticated, async (req, res) => {
    try {
      const blockout = await storage.createBlockout(req.body);
      res.json(blockout);
    } catch (error) {
      res.status(500).json({ message: "Failed to create blockout" });
    }
  });

  app.delete("/api/blockouts/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteBlockout(req.params.id);
      res.json({ message: "Blockout deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blockout" });
    }
  });

  app.get("/api/events/:eventId/songs", isAuthenticated, async (req, res) => {
    try {
      const eventSongs = await storage.getEventSongs(req.params.eventId);
      res.json(eventSongs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event songs" });
    }
  });

  app.post("/api/events/:eventId/songs", isAuthenticated, async (req, res) => {
    try {
      const eventSong = await storage.addEventSong({
        eventId: req.params.eventId,
        ...req.body,
      });
      res.json(eventSong);
    } catch (error) {
      res.status(500).json({ message: "Failed to add song to event" });
    }
  });

  app.delete(
    "/api/events/:eventId/songs/:songId",
    isAuthenticated,
    async (req, res) => {
      try {
        await storage.removeEventSong(req.params.eventId, req.params.songId);
        res.json({ message: "Song removed from event successfully" });
      } catch (error) {
        res.status(500).json({ message: "Failed to remove song from event" });
      }
    }
  );
}
