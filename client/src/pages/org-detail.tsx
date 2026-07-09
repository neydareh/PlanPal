import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  useToast,
} from "@neydareh/ui";
import { Plus, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useState } from "react";

type Organization = {
  id: string;
  name: string;
  teamCount?: number;
  memberCount?: number;
};

type Team = {
  id: string;
  name: string;
  orgId: string;
};

type OrgMember = {
  id: string;
  userId: string;
  role: "admin" | "member";
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
};

export default function OrgDetail() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [match, params] = useRoute("/orgs/:orgId");
  const orgId = params?.orgId;

  const [teamName, setTeamName] = useState("");

  const { data: org, isLoading: isLoadingOrg } = useQuery<Organization>({
    queryKey: ["/api/orgs", orgId ?? ""],
    enabled: !!orgId,
    retry: false,
  });

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ["/api/orgs", orgId ?? "", "teams"],
    enabled: !!orgId,
    retry: false,
  });

  const { data: members = [], isLoading: isLoadingMembers } = useQuery<
    OrgMember[]
  >({
    queryKey: ["/api/orgs", orgId ?? "", "members"],
    enabled: !!orgId,
    retry: false,
  });

  const createTeamMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest(
        "POST",
        `/api/orgs/${orgId}/teams`,
        { name }
      );
      return response.json();
    },
    onSuccess: () => {
      setTeamName("");
      void queryClient.invalidateQueries({
        queryKey: ["/api/orgs", orgId ?? "", "teams"],
      });
      toast({ title: "Team created" });
    },
    onError: () => {
      toast({ title: "Failed to create team", variant: "destructive" });
    },
  });

  if (!match) {
    return null;
  }

  const isLoading = isLoadingOrg || isLoadingTeams || isLoadingMembers;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath="/orgs" />

      <div className="lg:ml-64">
        <TopNavBar title="Organization" />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <main className="p-4 lg:p-6 pt-20 lg:pt-6 space-y-6">
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {org?.name ?? "Organization"}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">
                        {org?.teamCount ?? teams.length} teams
                      </Badge>
                      <Badge variant="secondary">
                        {org?.memberCount ?? members.length} members
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Org ID: {orgId}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="glass-card xl:col-span-2">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Teams
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        placeholder="Team name"
                        value={teamName}
                        onChange={(event) => {
                          setTeamName(event.target.value);
                        }}
                        className="sm:w-52"
                      />
                      <Button
                        onClick={() => {
                          if (!teamName.trim()) {
                            toast({
                              title: "Team name required",
                              variant: "destructive",
                            });
                            return;
                          }
                          createTeamMutation.mutate(teamName.trim());
                        }}
                        disabled={createTeamMutation.isPending}
                        className="bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Team
                      </Button>
                    </div>
                  </div>

                  {teams.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No teams yet. Create one to start assigning roles.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teams.map((team) => (
                        <Card key={team.id} className="border border-gray-200 dark:border-gray-700">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="text-base font-semibold text-gray-900 dark:text-white">
                                {team.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Team ID: {team.id}
                              </p>
                            </div>
                            <Link href={`/orgs/${orgId}/teams/${team.id}`}>
                              <Button variant="ghost" size="sm">
                                View
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
