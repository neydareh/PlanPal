import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
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
  useToast,
} from "@neydareh/ui";
import { ArrowLeft, Plus, Trash2, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useState } from "react";
import { UserDisplay } from "@/components/UserDisplay";

type Team = {
  id: string;
  name: string;
  orgId: string;
};

type TeamMember = {
  id: string;
  userId: string;
  role: "admin" | "member";
  memberFunction?: "vocalist" | "bass" | "piano" | "guitar" | "other" | null;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
};

const memberFunctions = ["vocalist", "bass", "piano", "guitar", "other"] as const;

export default function TeamDetail() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [match, params] = useRoute("/orgs/:orgId/teams/:teamId");
  const orgId = params?.orgId;
  const teamId = params?.teamId;

  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState<"admin" | "member">("member");
  const [memberFunction, setMemberFunction] =
    useState<(typeof memberFunctions)[number]>("vocalist");

  const { data: team, isLoading: isLoadingTeam } = useQuery<Team>({
    queryKey: ["/api/orgs", orgId ?? "", "teams", teamId ?? ""],
    enabled: !!orgId && !!teamId,
    retry: false,
  });

  const { data: members = [], isLoading: isLoadingMembers } = useQuery<
    TeamMember[]
  >({
    queryKey: [
      "/api/orgs",
      orgId ?? "",
      "teams",
      teamId ?? "",
      "members",
    ],
    enabled: !!orgId && !!teamId,
    retry: false,
  });

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      const payload =
        memberRole === "admin"
          ? { userId: memberUserId, role: memberRole }
          : {
              userId: memberUserId,
              role: memberRole,
              memberFunction,
            };
      const response = await apiRequest(
        "POST",
        `/api/orgs/${orgId}/teams/${teamId}/members`,
        payload
      );
      return response.json();
    },
    onSuccess: () => {
      setMemberUserId("");
      setMemberRole("member");
      setMemberFunction("vocalist");
      void queryClient.invalidateQueries({
        queryKey: [
          "/api/orgs",
          orgId ?? "",
          "teams",
          teamId ?? "",
          "members",
        ],
      });
      toast({ title: "Team member added" });
    },
    onError: () => {
      toast({ title: "Failed to add team member", variant: "destructive" });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (payload: {
      memberId: string;
      role: "admin" | "member";
      memberFunction?: (typeof memberFunctions)[number] | null;
    }) =>
      apiRequest(
        "PATCH",
        `/api/orgs/${orgId}/teams/${teamId}/members/${payload.memberId}`,
        payload.role === "admin"
          ? { role: payload.role }
          : {
              role: payload.role,
              memberFunction: payload.memberFunction,
            }
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [
          "/api/orgs",
          orgId ?? "",
          "teams",
          teamId ?? "",
          "members",
        ],
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
        `/api/orgs/${orgId}/teams/${teamId}/members/${memberId}`
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [
          "/api/orgs",
          orgId ?? "",
          "teams",
          teamId ?? "",
          "members",
        ],
      });
    },
    onError: () => {
      toast({ title: "Failed to remove member", variant: "destructive" });
    },
  });

  if (!match) {
    return null;
  }

  const isLoading = isLoadingTeam || isLoadingMembers;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath="/orgs" />

      <div className="lg:ml-64">
        <TopNavBar title="Team Details" />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <main className="p-4 lg:p-6 pt-20 lg:pt-6 space-y-6">
            <Card className="glass-card">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <Link href={`/orgs/${orgId}`}>
                    <Button variant="ghost" size="sm" className="mb-3">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to org
                    </Button>
                  </Link>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {team?.name ?? "Team"}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{members.length} members</Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Team ID: {teamId}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Team members
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                  <Input
                    placeholder="User ID"
                    value={memberUserId}
                    onChange={(event) => setMemberUserId(event.target.value)}
                  />
                  <Select
                    value={memberRole}
                    onValueChange={(value: "admin" | "member") =>
                      setMemberRole(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={memberFunction}
                    onValueChange={(value: (typeof memberFunctions)[number]) =>
                      setMemberFunction(value)
                    }
                    disabled={memberRole === "admin"}
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
                <Button
                  onClick={() => {
                    if (!memberUserId.trim()) {
                      toast({
                        title: "User ID required",
                        variant: "destructive",
                      });
                      return;
                    }
                    addMemberMutation.mutate();
                  }}
                  disabled={addMemberMutation.isPending}
                  className="bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>

                <div className="mt-6 space-y-3">
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
                            {member.userId}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMemberMutation.mutate(member.id)}
                          disabled={removeMemberMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <Select
                          value={member.role}
                          onValueChange={(value: "admin" | "member") =>
                            updateMemberMutation.mutate({
                              memberId: member.id,
                              role: value,
                              memberFunction:
                                value === "admin"
                                  ? null
                                  : (member.memberFunction as
                                      | (typeof memberFunctions)[number]
                                      | null) ?? "vocalist",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={(member.memberFunction ?? "vocalist") as string}
                          onValueChange={(value) =>
                            updateMemberMutation.mutate({
                              memberId: member.id,
                              role: member.role,
                              memberFunction: value as (typeof memberFunctions)[number],
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
                      No team members yet. Add someone to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        )}
      </div>
    </div>
  );
}
