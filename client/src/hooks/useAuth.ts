import { User } from "@shared/schema";

const guestUser: User = {
  id: "49809adf-f9fc-45ef-be94-29a533420e59",
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
