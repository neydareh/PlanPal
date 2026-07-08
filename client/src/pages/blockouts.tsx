import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthContext";
import { useOrgContext } from "@/hooks/useOrgContext";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import BlockoutDetailsModal from "@/components/BlockoutDetailsModal";
import {
  useToast,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Badge,
} from "@neydareh/ui";
import { CalendarDays, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBlockoutSchema } from "@shared/schema";
import type { InsertBlockout } from "@shared/schema";
import { z } from "zod";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Blockout } from "@/types/blockout";
import { Team, TeamMember } from "@/types";
import { BlockoutCard } from "@/components/BlockoutCard";

const blockoutFormSchema = insertBlockoutSchema.omit({ orgId: true }).extend({
  startDate: z.string(),
  endDate: z.string(),
  userId: z.string().optional(),
});

interface IBlockoutFormData {
  startDate: string;
  endDate: string;
  userId: string;
  reason: string;
}

export default function Blockouts() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { orgId } = useOrgContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBlockout, setEditingBlockout] = useState<Blockout>();
  const [selectedBlockoutId, setSelectedBlockoutId] = useState<string | null>(
    null,
  );
  const [isBlockoutDetailsModalOpen, setIsBlockoutDetailsModalOpen] =
    useState(false);

  const isUserAdmin = useCallback(() => user?.role === "admin", [user]);

  const { data: blockoutData, isLoading: isBlockoutLoading } = useQuery<{
    data: Blockout[];
  }>({
    queryKey: ["/api/blockouts"],
    retry: false,
  });

  const { data: teams = [], isLoading: isTeamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/orgs", orgId ?? "", "teams"],
    enabled: !!orgId,
    retry: false,
  });

  const { data: memberData = [], isLoading: isMembersLoading } = useQuery<
    TeamMember[]
  >({
    queryKey: [
      "/api/orgs",
      orgId ?? "",
      "teams",
      "members",
      teams.map((team) => team.id).join(","),
    ],
    enabled: !!orgId && teams.length > 0,
    queryFn: async () => {
      const membersByTeam = await Promise.all(
        teams.map(async (team) => {
          const response = await apiRequest(
            "GET",
            `/api/orgs/${orgId}/teams/${team.id}/members`,
          );
          return response.json();
        }),
      );

      const uniqueMembers = new Map<string, TeamMember>();
      for (const teamMembers of membersByTeam) {
        for (const member of teamMembers as TeamMember[]) {
          const key = member.userId ?? member.id;
          if (!uniqueMembers.has(key)) {
            uniqueMembers.set(key, member);
          }
        }
      }

      return Array.from(uniqueMembers.values());
    },
    retry: false,
  });

  const isTeamMembersLoading = isTeamsLoading || isMembersLoading;

  // Form setup
  const form = useForm<IBlockoutFormData>({
    resolver: zodResolver(blockoutFormSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  // Get blockouts
  const blockouts = blockoutData?.data ?? [];
  const visibleBlockouts = isUserAdmin()
    ? blockouts
    : blockouts.filter((blockout) => blockout.userId === user?.id);

  // Create blockout mutation
  const createBlockoutMutation = useMutation({
    mutationFn: async (data: InsertBlockout) => {
      const response = await apiRequest("POST", `/api/blockouts`, data);
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["/api/blockouts"],
      });
      toast({
        title: "Success",
        description: "Blockout created successfully!",
      });
      setIsCreateModalOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create blockout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update blockout mutation
  const updateBlockoutMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InsertBlockout>;
    }) => {
      const response = await apiRequest("PUT", `/api/blockouts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["/api/blockouts"],
      });
      toast({
        title: "Success",
        description: "Blockout updated successfully!",
      });
      setEditingBlockout(undefined);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update blockout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete blockout mutation
  const deleteBlockoutMutation = useMutation({
    mutationFn: async (blockoutId: string) => {
      await apiRequest("DELETE", `/api/blockouts/${blockoutId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["/api/blockouts"],
      });
      toast({
        title: "Success",
        description: "Blockout deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete blockout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IBlockoutFormData) => {
    if (!user?.id) return;

    const blockoutData: InsertBlockout = {
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      reason: data.reason,
      userId: isUserAdmin() ? data.userId || user.id : user.id,
    };

    if (editingBlockout) {
      updateBlockoutMutation.mutate({
        id: editingBlockout.id,
        data: blockoutData,
      });
    } else {
      createBlockoutMutation.mutate(blockoutData);
    }
  };

  const handleEdit = (blockout: Blockout) => {
    setEditingBlockout(blockout);
    form.reset({
      startDate: new Date(blockout.startDate).toISOString().split("T")[0],
      endDate: new Date(blockout.endDate).toISOString().split("T")[0],
      reason: blockout.reason || "",
      userId: blockout.userId,
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingBlockout(undefined);
    form.reset();
  };

  // Sort blockouts by start date
  const sortedBlockouts = [...visibleBlockouts].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath={"/blockouts"} />

      <div className="lg:ml-64">
        <TopNavBar title="" />

        {isBlockoutLoading || isTeamMembersLoading ? (
          <LoadingSpinner />
        ) : (
          <main className="p-4 lg:p-4 pt-20 lg:pt-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {/* Title */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isUserAdmin() ? "Team Blockouts" : "My Blockouts"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {isUserAdmin()
                      ? "Manage the team's blockouts"
                      : "Manage your unavailable dates"}
                  </p>
                </div>

                {/* Add Blockout Button */}
                <Button
                  onClick={() => {
                    setIsCreateModalOpen(true);
                  }}
                  className="bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Blockout
                </Button>

                <Dialog
                  open={isCreateModalOpen}
                  onOpenChange={(open) => {
                    if (!open) handleCloseModal();
                  }}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingBlockout
                          ? "Edit Blockout"
                          : "Create New Blockout"}
                      </DialogTitle>
                    </DialogHeader>

                    {/* Form */}
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      {user?.role === "admin" && (
                        <div>
                          <Label htmlFor="userId">User</Label>
                          <Select
                            onValueChange={(value) =>
                              form.setValue("userId", value)
                            }
                            defaultValue={form.getValues("userId") || user?.id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                            <SelectContent>
                              {memberData?.map((member) => {
                                console.log("member => ", member);
                                return (
                                  <SelectItem
                                    key={member.id}
                                    value={
                                      member.userId?.toString() ?? member.id
                                    }
                                  >
                                    {member.user?.firstName ?? "Member"}{" "}
                                    {member.user?.lastName ?? ""}{" "}
                                    {member.user?.email
                                      ? `(${member.user.email})`
                                      : ""}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          {...form.register("startDate")}
                        />
                        {form.formState.errors.startDate && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.startDate.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          {...form.register("endDate")}
                        />
                        {form.formState.errors.endDate && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.endDate.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="reason">Reason (Optional)</Label>
                        <Textarea
                          id="reason"
                          placeholder="Vacation, family event, etc."
                          {...form.register("reason")}
                        />
                        {form.formState.errors.reason && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.reason.message}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseModal}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            createBlockoutMutation.isPending ||
                            updateBlockoutMutation.isPending
                          }
                        >
                          {editingBlockout ? "Update" : "Create"} Blockout
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Blockouts List */}
            {sortedBlockouts.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No blockouts yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add blockouts for dates when you're unavailable to serve.
                  </p>
                  <Button
                    onClick={() => {
                      setIsCreateModalOpen(true);
                    }}
                    className="bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Blockout
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedBlockouts.map((blockout) => {
                  const startDate = new Date(blockout.startDate);
                  const endDate = new Date(blockout.endDate);
                  const isActive =
                    new Date() >= startDate && new Date() <= endDate;
                  const isPast = new Date() > endDate;

                  return (
                    <BlockoutCard
                      blockout={blockout}
                      isActive={isActive}
                      isPast={isPast}
                      startDate={startDate}
                      endDate={endDate}
                      handleEdit={handleEdit}
                      setSelectedBlockoutId={setSelectedBlockoutId}
                      setIsBlockoutDetailsModalOpen={
                        setIsBlockoutDetailsModalOpen
                      }
                    />
                  );
                })}
              </div>
            )}
          </main>
        )}
      </div>

      <BlockoutDetailsModal
        isOpen={isBlockoutDetailsModalOpen}
        onClose={() => {
          setIsBlockoutDetailsModalOpen(false);
          setSelectedBlockoutId(null);
        }}
        blockoutId={selectedBlockoutId}
      />
    </div>
  );
}
