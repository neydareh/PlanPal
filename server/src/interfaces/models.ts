export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: 'admin' | 'user';
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  createdBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo?: number;
  createdBy: string;
  youtubeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventSong {
  eventId: string;
  songId: string;
  order: number;
}