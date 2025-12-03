import { Request, Response } from "express";
import { EventService } from "../services/event.service";
import { CreateEventSchema } from "../interfaces/dto";

export class EventController {
  constructor(private eventService: EventService) {}

  async getEvents(req: Request, res: Response) {
    try {
      const events = await this.eventService.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  }

  async getEvent(req: Request, res: Response) {
    try {
      const event = await this.eventService.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  }

  async createEvent(req: Request & { user?: unknown }, res: Response) {
    try {
      // Validate input using the schema
      const validationResult = CreateEventSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors,
        });
      }

      const event = await this.eventService.createEvent({
        ...validationResult.data,
        createdBy: validationResult.data.createdBy,
      });

      res.status(201).json(event);
    } catch (error) {
      // Handle specific error types
      if (error instanceof Error) {
        console.error("Event creation error:", error);
        if (error.message.includes("duplicate")) {
          return res.status(409).json({ message: "Event already exists" });
        }
        if (error.message.includes("foreign key")) {
          return res.status(400).json({ message: "Invalid user reference" });
        }
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const event = await this.eventService.updateEvent(
        req.params.id,
        req.body
      );
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      await this.eventService.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  }

  async getEventSongs(req: Request, res: Response) {
    try {
      const songs = await this.eventService.getEventSongs(req.params.id);
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event songs" });
    }
  }
}
