import { useUser } from "@/hooks/useUser";
import { cn } from "@planpal/ui";

interface UserDisplayProps {
  userId: string;
  className?: string;
  showEmail?: boolean;
}

export const UserDisplay = ({ userId, className, showEmail = false }: UserDisplayProps) => {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) {
    return <span className={cn("animate-pulse", className)}>Loading...</span>;
  }

  if (!user) {
    return <span className={className}>Unknown User</span>;
  }

  return (
    <span className={className}>
      {user.firstName} {user.lastName}
      {showEmail && <span className="text-muted-foreground ml-1">({user.email})</span>}
    </span>
  );
};
