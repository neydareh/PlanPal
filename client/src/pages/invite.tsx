import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Badge, Button, Card, CardContent } from "@neydareh/ui";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuthContext } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

type InviteDetails = {
  invite: {
    id: string;
    email: string;
    role: "admin" | "user";
    memberFunction?: string | null;
    message?: string | null;
    status: "pending" | "accepted" | "declined" | "expired" | "revoked";
    expiresAt: string;
  };
  team: {
    id: string;
    name: string;
  } | null;
};

export default function Invite() {
  const [match, params] = useRoute("/invites/:token");
  const token = params?.token ?? "";
  const { isAuthenticated, login, register } = useAuthContext();
  const [inviteAction, setInviteAction] = useState<
    "accepted" | "declined" | null
  >(null);

  const {
    data,
    isLoading: isLoadingInvite,
    error,
  } = useQuery<InviteDetails>({
    queryKey: ["/api/invites", token],
    enabled: !!token && isAuthenticated,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/invites/${token}/accept`);
      return response.json();
    },
    onSuccess: () => {
      setInviteAction("accepted");
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST",
        `/api/invites/${token}/decline`,
      );
      return response.json();
    },
    onSuccess: () => {
      setInviteAction("declined");
    },
  });

  if (!match) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <Card className="glass-card w-full max-w-lg">
          <CardContent className="p-6 space-y-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              Sign in to view invite
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please log in or register to view this team invitation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  void login();
                }}
              >
                Log in
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  void register();
                }}
              >
                Register
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingInvite) {
    return <LoadingSpinner />;
  }

  if (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load invite";
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <Card className="glass-card w-full max-w-lg">
          <CardContent className="p-6 space-y-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              Invite unavailable
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
            <Link href="/orgs">
              <Button variant="outline">Go to orgs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { invite, team } = data;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <Card className="glass-card w-full max-w-lg">
        <CardContent className="p-6 space-y-4">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Team invitation
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {team?.name ?? "Team"} invited you as{" "}
            {invite.role === "admin" ? "Admin" : "Member"}.
          </div>
          {invite.message && (
            <div className="text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md p-3">
              {invite.message}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{invite.status}</Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Expires {new Date(invite.expiresAt).toLocaleDateString()}
            </span>
          </div>
          {inviteAction ? (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {inviteAction === "accepted" ? (
                <>
                  <p>Invite accepted. You can now access the team.</p>
                </>
              ) : (
                "Invite declined. You can ignore this link."
              )}
              {invite.status === "accepted" && (
                <Link href="/">
                  Go To App
                  {/* <Button variant="ghost">Go To App</Button> */}
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  acceptMutation.mutate();
                }}
                disabled={
                  acceptMutation.isPending || invite.status !== "pending"
                }
              >
                Accept invite
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  declineMutation.mutate();
                }}
                disabled={
                  declineMutation.isPending || invite.status !== "pending"
                }
              >
                Decline
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
