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

export interface IEventData {
  eventData: CreateEventDTO & { createdBy: string };
}

export interface IEventService {
  getEvents(
    orgId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Event>>;
  getEvent(orgId: string, id: string): Promise<Event | null>;
  updateEvent(
    orgId: string,
    id: string,
    eventData: UpdateEventDTO,
  ): Promise<Event>;
  deleteEvent(orgId: string, id: string): Promise<void>;
}

export type IUserData = Omit<User, "id" | "createdAt" | "updatedAt" >;
export type IEnrichedUserData = IUserData & {
  role: [{ id: string; key: string; name: "admin" | "user" }];
};

export interface IUserService {
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
}

export interface ISongData {
  songData: Omit<Song, "id" | "createdAt" | "updatedAt">;
}

export interface ISongService {
  getSongs(
    orgId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Song>>;
  updateSong(orgId: string, id: string, songData: Partial<Song>): Promise<Song>;
  deleteSong(orgId: string, id: string): Promise<void>;
}

export interface IBlockoutService {
  createBlockout(
    blockoutData: CreateBlockoutDTO & { orgId: string },
  ): Promise<any>;
  deleteBlockout(orgId: string, id: string): Promise<void>;
}
