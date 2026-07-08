export interface User {
  id: string;
  authProviderId?: string | null;
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
  orgId: string | null;
  title: string;
  description: string | null;
  date: Date;
  createdBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Song {
  id: string;
  orgId: string | null;
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

export interface Blockout {
  id: string;
  orgId: string | null;
  userId: string;
  startDate: Date;
  endDate: Date;
  reason: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Organization {
  id: string;
  name: string;
  orgCode?: string | null;
  createdBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Team {
  id: string;
  orgId: string;
  name: string;
  createdBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface OrgTeamMembership {
  id: string;
  orgId: string;
  teamId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: "admin" | "user";
  memberFunction:
    | "vocalist"
    | "bass"
    | "piano"
    | "guitar"
    | "other"
    | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: "admin" | "user";
  memberFunction:
    | "vocalist"
    | "bass"
    | "piano"
    | "guitar"
    | "other"
    | null;
  message: string | null;
  tokenHash: string;
  status: "pending" | "accepted" | "declined" | "expired" | "revoked";
  expiresAt: Date;
  createdBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
