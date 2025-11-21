import { User } from "@shared/schema";

const guestUser: User = {
  id: "guest-user",
  email: "guest@planpal.app",
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  profileImageUrl: null,
};

export const useAuth = () => ({
  user: guestUser,
  isLoading: false,
  isAuthenticated: true,
});
