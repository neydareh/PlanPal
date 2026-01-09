import { User, Event, Song } from "./models";
import { CreateEventDTO, UpdateEventDTO, CreateBlockoutDTO } from "./dto";
import { PaginatedResult } from "../utils/pagination";

export interface IAuthService {
  verifyToken(token: string): Promise<any>;
  getManagementClient(): any;
}

export interface IEventService {
  getEvents(page?: number, limit?: number): Promise<PaginatedResult<Event>>;
  getEvent(id: string): Promise<Event | null>;
  createEvent(
    eventData: CreateEventDTO & { createdBy: string }
  ): Promise<Event>;
  updateEvent(id: string, eventData: UpdateEventDTO): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
}

export interface IUserService {
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  createUser(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
}

export interface ISongService {
  getSongs(page?: number, limit?: number): Promise<PaginatedResult<Song>>;
  createSong(
    songData: Omit<Song, "id" | "createdAt" | "updatedAt">
  ): Promise<Song>;
  updateSong(id: string, songData: Partial<Song>): Promise<Song>;
  deleteSong(id: string): Promise<void>;
}

export interface IBlockoutService {
  getBlockouts(
    page?: number,
    limit?: number
  ): Promise<PaginatedResult<unknown>>; // Using any for now as Blockout model import might be tricky without circular deps or moving things
  createBlockout(blockoutData: CreateBlockoutDTO): Promise<any>;
  deleteBlockout(id: string): Promise<void>;
}
