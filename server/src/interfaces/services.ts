import { User, Event, Song } from "./models";
import { CreateEventDTO, UpdateEventDTO, CreateBlockoutDTO } from "./dto";
import { PaginatedResult } from "../utils/pagination";

export interface IAuthService {
  verifyToken(token: string): Promise<any>;
  getManagementClient(): any;
}

export interface IEventData {
  eventData: CreateEventDTO & { createdBy: string };
}

export interface IEventService {
  getEvents(page?: number, limit?: number): Promise<PaginatedResult<Event>>;
  getEvent(id: string): Promise<Event | null>;
  updateEvent(id: string, eventData: UpdateEventDTO): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
}

export type IUserData = Omit<User, "id" | "createdAt" | "updatedAt">;

export interface IUserService {
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
}

export interface ISongData {
  songData: Omit<Song, "id" | "createdAt" | "updatedAt">;
}

export interface ISongService {
  getSongs(page?: number, limit?: number): Promise<PaginatedResult<Song>>;
  updateSong(id: string, songData: Partial<Song>): Promise<Song>;
  deleteSong(id: string): Promise<void>;
}

export interface IBlockoutService {
  createBlockout(blockoutData: CreateBlockoutDTO): Promise<any>;
  deleteBlockout(id: string): Promise<void>;
}
