import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Badge, Button, Card, CardContent } from "@neydareh/ui";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { MemberFunction, Team, TeamMember } from "@/types";
import { TeamMemberListCard } from "@/components/TeamMemberListCard";
import { TeamInviteListCard } from "@/components/TeamInviteListCard";

const memberFunctions: MemberFunction[] = [
  "vocalist",
  "bass",
  "piano",
  "guitar",
  "other",
];

export default function TeamDetail() {
  const [match, params] = useRoute("/orgs/:orgId/teams/:teamId");
  const orgId = params?.orgId;
  const teamId = params?.teamId;

  const { data: team, isLoading: isLoadingTeam } = useQuery<Team>({
    queryKey: ["/api/orgs", orgId ?? "", "teams", teamId ?? ""],
    enabled: !!orgId && !!teamId,
    retry: false,
  });

  const { data: members = [], isLoading: isLoadingMembers } = useQuery<
    TeamMember[]
  >({
    queryKey: ["/api/orgs", orgId ?? "", "teams", teamId ?? "", "members"],
    enabled: !!orgId && !!teamId,
    retry: false,
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
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <TeamMemberListCard
                members={members}
                memberFunctions={memberFunctions}
              />

              <TeamInviteListCard memberFunctions={memberFunctions} />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
