import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, Plus, ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { apiRequest } from "@/lib/queryClient";
import {
  Button,
  Card,
  CardContent,
  Input,
  useToast,
} from "@neydareh/ui";
import { useState } from "react";

type Organization = {
  id: string;
  orgCode?: string | null;
  name: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function Orgs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orgName, setOrgName] = useState("");

  const { data: orgs = [], isLoading } = useQuery<Organization[]>({
    queryKey: ["/api/orgs"],
    retry: false,
  });

  const createOrgMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/orgs", { name });
      return response.json();
    },
    onSuccess: () => {
      setOrgName("");
      void queryClient.invalidateQueries({ queryKey: ["/api/orgs"] });
      toast({ title: "Organization created" });
    },
    onError: () => {
      toast({
        title: "Unable to create organization",
        variant: "destructive",
      });
    },
  });

  const handleCreateOrg = () => {
    if (!orgName.trim()) {
      toast({
        title: "Organization name required",
        variant: "destructive",
      });
      return;
    }
    createOrgMutation.mutate(orgName.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath="/orgs" />

      <div className="lg:ml-64">
        <TopNavBar title="Organizations" />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <main className="p-4 lg:p-6 pt-20 lg:pt-6">
            {/* Your Organization Header */}
            <Card className="glass-card mb-6">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Your organizations
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Create teams, assign roles, and manage members for each org.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Input
                      placeholder="Organization name"
                      value={orgName}
                      onChange={(event) => setOrgName(event.target.value)}
                      className="sm:w-64"
                    />
                    <Button
                      onClick={handleCreateOrg}
                      className="bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                      disabled={createOrgMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Org
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {orgs.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No organizations yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create your first organization to start building teams.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {orgs.map((org) => (
                  <Card key={org.id} className="glass-card">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        {/* card title */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {org.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Org ID: {org.id}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                      </div>
                      <div className="mt-5 flex items-center justify-between">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Updated{" "}
                          {org.updatedAt
                            ? new Date(org.updatedAt).toLocaleDateString()
                            : "recently"}
                        </div>
                        <Link href={`/orgs/${org.orgCode ?? org.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
