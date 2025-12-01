import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useUser(userId: string | number | undefined | null) {
  return useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
    // The queryFn is automatically handled by the default query function in queryClient.ts
    // which uses the queryKey to construct the URL.
    // However, since our queryKey is an array, we need to ensure the default queryFn handles it
    // or provide a specific queryFn here.
    // Looking at queryClient.ts: const res = await fetch(queryKey.join("/") as string, ...
    // So ["/api/users", userId] becomes "/api/users/123" which matches our endpoint.
  });
}
