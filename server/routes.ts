import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertSongSchema, insertBlockoutSchema, insertEventSongSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Events routes
  app.get('/api/events', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let events;
      if (startDate && endDate) {
        events = await storage.getEventsByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        events = await storage.getEvents();
      }
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const eventData = insertEventSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const eventData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(req.params.id, eventData);
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Songs routes
  app.get('/api/songs', isAuthenticated, async (req, res) => {
    try {
      const { search, key } = req.query;
      const songs = await storage.searchSongs(
        search as string,
        key as string
      );
      res.json(songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  });

  app.get('/api/songs/:id', isAuthenticated, async (req, res) => {
    try {
      const song = await storage.getSong(req.params.id);
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }
      res.json(song);
    } catch (error) {
      console.error("Error fetching song:", error);
      res.status(500).json({ message: "Failed to fetch song" });
    }
  });

  app.post('/api/songs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const songData = insertSongSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const song = await storage.createSong(songData);
      res.status(201).json(song);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid song data", errors: error.errors });
      }
      console.error("Error creating song:", error);
      res.status(500).json({ message: "Failed to create song" });
    }
  });

  app.put('/api/songs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const songData = insertSongSchema.partial().parse(req.body);
      const song = await storage.updateSong(req.params.id, songData);
      res.json(song);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid song data", errors: error.errors });
      }
      console.error("Error updating song:", error);
      res.status(500).json({ message: "Failed to update song" });
    }
  });

  app.delete('/api/songs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteSong(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting song:", error);
      res.status(500).json({ message: "Failed to delete song" });
    }
  });

  // Blockouts routes
  app.get('/api/blockouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate, all } = req.query;
      
      let blockouts;
      if (all === 'true') {
        // Admin can see all blockouts
        const user = await storage.getUser(userId);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: "Admin access required" });
        }
        
        if (startDate && endDate) {
          blockouts = await storage.getBlockoutsByDateRange(
            new Date(startDate as string),
            new Date(endDate as string)
          );
        } else {
          blockouts = await storage.getBlockouts();
        }
      } else {
        // Regular users see only their blockouts
        blockouts = await storage.getBlockoutsByUser(userId);
      }
      
      res.json(blockouts);
    } catch (error) {
      console.error("Error fetching blockouts:", error);
      res.status(500).json({ message: "Failed to fetch blockouts" });
    }
  });

  app.post('/api/blockouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blockoutData = insertBlockoutSchema.parse({
        ...req.body,
        userId,
      });

      const blockout = await storage.createBlockout(blockoutData);
      res.status(201).json(blockout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blockout data", errors: error.errors });
      }
      console.error("Error creating blockout:", error);
      res.status(500).json({ message: "Failed to create blockout" });
    }
  });

  app.put('/api/blockouts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blockout = await storage.getBlockouts();
      const userBlockout = blockout.find(b => b.id === req.params.id && b.userId === userId);
      
      if (!userBlockout) {
        return res.status(404).json({ message: "Blockout not found or access denied" });
      }

      const blockoutData = insertBlockoutSchema.partial().parse(req.body);
      const updatedBlockout = await storage.updateBlockout(req.params.id, blockoutData);
      res.json(updatedBlockout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blockout data", errors: error.errors });
      }
      console.error("Error updating blockout:", error);
      res.status(500).json({ message: "Failed to update blockout" });
    }
  });

  app.delete('/api/blockouts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blockouts = await storage.getBlockouts();
      const userBlockout = blockouts.find(b => b.id === req.params.id && b.userId === userId);
      
      if (!userBlockout) {
        return res.status(404).json({ message: "Blockout not found or access denied" });
      }

      await storage.deleteBlockout(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blockout:", error);
      res.status(500).json({ message: "Failed to delete blockout" });
    }
  });

  // Event-Song routes
  app.get('/api/events/:id/songs', isAuthenticated, async (req, res) => {
    try {
      const eventSongs = await storage.getEventSongs(req.params.id);
      res.json(eventSongs);
    } catch (error) {
      console.error("Error fetching event songs:", error);
      res.status(500).json({ message: "Failed to fetch event songs" });
    }
  });

  app.post('/api/events/:id/songs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const eventSongData = insertEventSongSchema.parse({
        ...req.body,
        eventId: req.params.id,
      });

      const eventSong = await storage.addSongToEvent(eventSongData);
      res.status(201).json(eventSong);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event song data", errors: error.errors });
      }
      console.error("Error adding song to event:", error);
      res.status(500).json({ message: "Failed to add song to event" });
    }
  });

  app.delete('/api/events/:eventId/songs/:songId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.removeSongFromEvent(req.params.eventId, req.params.songId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing song from event:", error);
      res.status(500).json({ message: "Failed to remove song from event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
