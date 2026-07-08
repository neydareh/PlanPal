import { MemberFunction } from "./member-function";

export interface TeamMember {
  id: string;
  userId: string;
  role: "admin" | "user";
  memberFunction?: MemberFunction;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
};