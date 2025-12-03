import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { EventService } from "../services/event.service";
import { validateRequest } from "../middleware/validation.middleware";
import { CreateEventSchema, UpdateEventSchema } from "../interfaces/dto";

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - date
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the event
 *         title:
 *           type: string
 *           description: The title of the event
 *         description:
 *           type: string
 *           nullable: true
 *           description: Optional description of the event
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time of the event
 *         createdBy:
 *           type: string
 *           description: User ID of the event creator
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the event was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the event was last updated
 *
 *     CreateEvent:
 *       type: object
 *       required:
 *         - title
 *         - date
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *
 *     UpdateEvent:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 */

const router = Router();
const eventService = new EventService();
const eventController = new EventController(eventService);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve a list of events
 *     description: Get a paginated list of all events. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: The number of items per page
 *     responses:
 *       200:
 *         description: A paginated list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get("/", (req, res) => {
  return eventController.getEvents(req, res);
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     description: Retrieve a single event by its ID. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       401:
 *         description: Not authenticated
 */
router.get("/:id", (req, res) => {
  return eventController.getEvent(req, res);
});

/**
 * @swagger
 * /events/{id}/songs:
 *   get:
 *     summary: Get songs for an event
 *     description: Retrieve all songs associated with an event. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: List of songs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Song'
 *       404:
 *         description: Event not found
 *       401:
 *         description: Not authenticated
 */
router.get("/:id/songs", (req, res) => {
  return eventController.getEventSongs(req, res);
});

/**
 * @swagger
 * /events/{id}/songs:
 *   post:
 *     summary: Add a song to an event
 *     description: Add a song to an event with an optional order. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - songId
 *             properties:
 *               songId:
 *                 type: string
 *                 description: The ID of the song to add
 *               order:
 *                 type: string
 *                 description: The order of the song in the event
 *     responses:
 *       201:
 *         description: Song added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Event or song not found
 */
router.post("/:id/songs", (req, res) => {
  return eventController.addEventSong(req, res);
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     description: Create a new event. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEvent'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.post("/", validateRequest(CreateEventSchema), (req, res) =>
  eventController.createEvent(req, res)
);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event
 *     description: Update an existing event by ID. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEvent'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
router.put(
  "/:id",
  // requireUser,
  validateRequest(UpdateEventSchema),
  (req, res) => eventController.updateEvent(req, res)
);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     description: Delete an event by ID. Requires admin authentication.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       204:
 *         description: Event deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Event not found
 */
router.delete(
  "/:id",
  // requireAdmin, // Only admins can delete events
  (req, res) => eventController.deleteEvent(req, res)
);

export const eventRoutes = router;
