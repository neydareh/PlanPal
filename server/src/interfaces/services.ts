import { User, Event, Song } from './models';
import { CreateEventDTO, UpdateEventDTO } from './dto';
import { PaginatedResult } from '../utils/pagination';

export interface IAuthService {
  verifyToken(token: string): Promise<any>;
  getManagementClient(): any;
}

export interface IEventService {
  getEvents(page?: number, limit?: number): Promise<PaginatedResult<Event>>;
  getEvent(id: string): Promise<Event | null>;
  createEvent(eventData: CreateEventDTO & { createdBy: string }): Promise<Event>;
  updateEvent(id: string, eventData: UpdateEventDTO): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
}

export interface IUserService {
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
}

export interface ISongService {
  getSongs(): Promise<Song[]>;
  getSong(id: string): Promise<Song | null>;
  createSong(songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song>;
  updateSong(id: string, songData: Partial<Song>): Promise<Song>;
  deleteSong(id: string): Promise<void>;
}