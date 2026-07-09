import { MemberFunction } from "./member-function";

export interface TeamInvite {
  id: string;
  email: string;
  role: "admin" | "user";
  memberFunction?: MemberFunction;
  message?: string | null;
  status: "pending" | "accepted" | "declined" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
}
