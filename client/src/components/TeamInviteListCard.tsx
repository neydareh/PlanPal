import { apiRequest, queryClient } from "@/lib/queryClient";
import { MemberFunction, TeamInvite } from "@/types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useToast,
} from "@neydareh/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Users, Plus } from "lucide-react";
import { useState } from "react";
import { useRoute } from "wouter";

interface ITeamInviteListCardProps {
  memberFunctions: MemberFunction[];
}

const inviteExpirations = [7, 14, 30] as const;

export const TeamInviteListCard = ({
  memberFunctions,
}: ITeamInviteListCardProps) => {
  const [, params] = useRoute("/orgs/:orgId/teams/:teamId");
  const orgId = params?.orgId;
  const teamId = params?.teamId;
  const { toast } = useToast();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "user">("user");
  const [inviteFunction, setInviteFunction] =
    useState<MemberFunction>("vocalist");
  const [inviteExpiresInDays, setInviteExpiresInDays] =
    useState<(typeof inviteExpirations)[number]>(14);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const buildInviteLink = (token: string) =>
    `${window.location.origin}/invites/${token}`;

  const createInviteMutation = useMutation({
    mutationFn: async () => {
      const payload =
        inviteRole === "admin"
          ? {
              email: inviteEmail.trim(),
              role: inviteRole,
              message: inviteMessage.trim() || undefined,
              expiresInDays: inviteExpiresInDays,
            }
          : {
              email: inviteEmail.trim(),
              role: inviteRole,
              memberFunction: inviteFunction,
              message: inviteMessage.trim() || undefined,
              expiresInDays: inviteExpiresInDays,
            };
      const response = await apiRequest(
        "POST",
        `/api/orgs/${orgId}/teams/${teamId}/invites`,
        payload,
      );
      return response.json();
    },
    onSuccess: (data: { token: string }) => {
      setInviteLink(buildInviteLink(data.token));
      setInviteEmail("");
      setInviteRole("user");
      setInviteFunction("vocalist");
      setInviteMessage("");
      setInviteExpiresInDays(14);
      void queryClient.invalidateQueries({
        queryKey: ["/api/orgs", orgId ?? "", "teams", teamId ?? "", "invites"],
      });
      toast({ title: "Invite created" });
    },
    onError: () => {
      toast({ title: "Failed to create invite", variant: "destructive" });
    },
  });

  const regenerateInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const response = await apiRequest(
        "POST",
        `/api/orgs/${orgId}/teams/${teamId}/invites/${inviteId}/regenerate`,
      );
      return response.json();
    },
    onSuccess: (data: { token: string }) => {
      setInviteLink(buildInviteLink(data.token));
      void queryClient.invalidateQueries({
        queryKey: ["/api/orgs", orgId ?? "", "teams", teamId ?? "", "invites"],
      });
      toast({ title: "Invite link regenerated" });
    },
    onError: () => {
      toast({ title: "Failed to regenerate invite", variant: "destructive" });
    },
  });

  const { data: invites = [] } = useQuery<TeamInvite[]>({
    queryKey: ["/api/orgs", orgId ?? "", "teams", teamId ?? "", "invites"],
    enabled: !!orgId && !!teamId,
    retry: false,
  });

  return (
    <Card className="glass-card w-full sm:basis-1/2">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Invites
          </h3>
        </div>

        {/* Send Invite */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Invite a member
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Email"
              value={inviteEmail}
              onChange={(event) => {
                setInviteEmail(event.target.value);
              }}
            />
            <Select
              value={inviteRole}
              onValueChange={(value: "admin" | "user") => {
                setInviteRole(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Member</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={inviteFunction}
              onValueChange={(value: MemberFunction) =>
                setInviteFunction(value)
              }
              disabled={inviteRole === "admin"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Function" />
              </SelectTrigger>
              <SelectContent>
                {memberFunctions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(inviteExpiresInDays)}
              onValueChange={(value) => {
                setInviteExpiresInDays(
                  Number(value) as (typeof inviteExpirations)[number],
                );
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Expires in" />
              </SelectTrigger>
              <SelectContent>
                {inviteExpirations.map((days) => (
                  <SelectItem key={days} value={String(days)}>
                    {days} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3">
            <Textarea
              placeholder="Optional message"
              value={inviteMessage}
              onChange={(event) => {
                setInviteMessage(event.target.value);
              }}
              rows={3}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Button
              onClick={() => {
                if (!inviteEmail.trim()) {
                  toast({
                    title: "Email required",
                    variant: "destructive",
                  });
                  return;
                }
                createInviteMutation.mutate();
              }}
              disabled={createInviteMutation.isPending}
              className="bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate invite link
            </Button>
            {inviteLink && (
              <Button
                variant="outline"
                onClick={() => {
                  void navigator.clipboard.writeText(inviteLink);
                  toast({ title: "Invite link copied" });
                }}
              >
                Copy link
              </Button>
            )}
          </div>
          {inviteLink && <Input value={inviteLink} readOnly className="mt-3" />}
        </div>

        {/* List of Invited Members */}
        <div className="mt-6 space-y-3 max-h-250 overflow-y-auto">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Invites
          </div>
          {invites.length > 0 ? (
            invites.map((invite) => (
              <div
                key={invite.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {invite.email}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Role: {invite.role === "admin" ? "Admin" : "Member"}
                      {invite.memberFunction
                        ? ` • ${invite.memberFunction}`
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{invite.status}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        invite.status !== "pending" ||
                        regenerateInviteMutation.isPending
                      }
                      onClick={() => {
                        regenerateInviteMutation.mutate(invite.id);
                      }}
                    >
                      Regenerate link
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Expires {new Date(invite.expiresAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No invites yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
