import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useUser(userId: string | number | undefined | null) {
  return useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });
}
