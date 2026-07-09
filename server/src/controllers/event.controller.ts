import { Request, Response } from "express";
import { EventService } from "../services/event.service";
import { CreateEventSchema } from "../interfaces/dto";
import { getOrgIdFromRequest } from "../utils/org-id";

export type EventRequest = {
  orgId?: string;
} & Request;

export class EventController {
  constructor(private eventService: EventService) {}

  async getEvents(req: Request, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);

      if (!orgId) {
        return res
          .status(400)
          .json({ message: "Organization ID was not found" });
      }

      const events = await this.eventService.getEvents(orgId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  }

  async getEvent(req: EventRequest, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);

      if (!orgId) {
        return res
          .status(400)
          .json({ message: "Organization ID was not found" });
      }

      const event = await this.eventService.getEvent(orgId, req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  }

  async createEvent(req: EventRequest, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);

      if (!orgId) {
        return res
          .status(400)
          .json({ message: "Organization ID was not found" });
      }

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
        orgId,
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

  async updateEvent(req: EventRequest, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);

      if (!orgId) {
        return res
          .status(400)
          .json({ message: "Organization ID was not found" });
      }

      const event = await this.eventService.updateEvent(
        orgId,
        req.params.id,
        req.body,
      );
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  }

  async deleteEvent(req: EventRequest, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);
      if (!orgId) {
        return res
          .status(400)
          .json({ message: "Organization ID was not found" });
      }

      await this.eventService.deleteEvent(orgId, req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  }

  async getEventSongs(req: EventRequest, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);
      if (!orgId) {
        return res
          .status(400)
          .json({ message: "Organization ID was not found" });
      }

      const songs = await this.eventService.getEventSongs(orgId, req.params.id);
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event songs" });
    }
  }

  async addEventSong(req: EventRequest, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);
      if (!orgId) {
        return res
          .status(400)
          .json({ message: "Organization ID was not found" });
      }

      const { songId, order } = req.body;
      if (!songId) {
        return res.status(400).json({ message: "Song ID is required" });
      }

      const eventSong = await this.eventService.addEventSong(
        orgId,
        req.params.id,
        songId,
        order,
      );
      res.status(201).json(eventSong);
    } catch (error) {
      res.status(500).json({ message: "Failed to add song to event" });
    }
  }
}
