import { useUser } from "@/hooks/useUser";

export const BlockoutUserDisplay = ({ userId, createdAt }: { userId: string, createdAt: Date | string | null }) => {
  const { data: user } = useUser(userId);

  return (
    <span>
      {user ? `${user.firstName} ${user.lastName}` : "Unknown User"} on{" "}
      {createdAt ? new Date(createdAt).toLocaleDateString() : "Unknown date"}
    </span>
  );
};