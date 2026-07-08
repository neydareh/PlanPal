import {
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "@neydareh/ui";
import { Users, DeleteIcon } from "lucide-react";
import { UserDisplay } from "./UserDisplay";
import { MemberFunction, TeamMember } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";

interface ITeamMemberListCardProps {
  members: TeamMember[];
  memberFunctions: MemberFunction[];
}

export const TeamMemberListCard = ({
  members,
  memberFunctions,
}: ITeamMemberListCardProps) => {
  const [_match, params] = useRoute("/orgs/:orgId/teams/:teamId");
  const orgId = params?.orgId;
  const teamId = params?.teamId;

  const updateMemberMutation = useMutation({
    mutationFn: async (payload: {
      memberId: string;
      role: "admin" | "user";
      memberFunction?: MemberFunction | null;
    }) =>
      apiRequest(
        "PATCH",
        `/api/orgs/${orgId}/teams/${teamId}/members/${payload.memberId}`,
        payload.role === "admin"
          ? { role: payload.role }
          : {
              role: payload.role,
              memberFunction: payload.memberFunction,
            },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["/api/orgs", orgId ?? "", "teams", teamId ?? "", "members"],
      });
    },
    onError: () => {
      toast({ title: "Failed to update member", variant: "destructive" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) =>
      apiRequest(
        "DELETE",
        `/api/orgs/${orgId}/teams/${teamId}/members/${memberId}`,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["/api/orgs", orgId ?? "", "teams", teamId ?? "", "members"],
      });
    },
    onError: () => {
      toast({ title: "Failed to remove member", variant: "destructive" });
    },
  });

  return (
    <Card className="glass-card w-full sm:basis-1/2">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team members
          </h3>
        </div>
        <div className="mt-6 space-y-3 max-h-250 overflow-y-auto">
          {members.map((member) => (
            <div
              key={member.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  {member.user ? (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.user.firstName || member.user.email}{" "}
                      {member.user.lastName || ""}
                    </div>
                  ) : (
                    <UserDisplay
                      userId={member.userId}
                      className="text-sm font-medium text-gray-900 dark:text-white"
                      showEmail
                    />
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {member.user?.email}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeMemberMutation.mutate(member.id)}
                  disabled={removeMemberMutation.isPending}
                >
                  Remove Member
                  <DeleteIcon />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Select
                  value={member.role}
                  onValueChange={(value: "admin" | "user") =>
                    updateMemberMutation.mutate({
                      memberId: member.id,
                      role: value,
                      memberFunction:
                        value === "admin"
                          ? null
                          : ((member.memberFunction as MemberFunction | null) ??
                            "vocalist"),
                    })
                  }
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
                  value={(member.memberFunction ?? "vocalist") as string}
                  onValueChange={(value) =>
                    updateMemberMutation.mutate({
                      memberId: member.id,
                      role: member.role,
                      memberFunction: value as MemberFunction,
                    })
                  }
                  disabled={member.role === "admin"}
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
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No team members yet. Generate an invitation link and send to
              someone to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
