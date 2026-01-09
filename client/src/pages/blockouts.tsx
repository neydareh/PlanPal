import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
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
import { CalendarDays, Plus, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBlockoutSchema } from "@shared/schema";
import type { Blockout, InsertBlockout, User } from "@shared/schema";
import { z } from "zod";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BlockoutUserDisplay } from "@/components/BlockoutUserDisplay";

const blockoutFormSchema = insertBlockoutSchema.extend({
  startDate: z.string(),
  endDate: z.string(),
  userId: z.string().optional(),
});

type BlockoutFormData = z.infer<typeof blockoutFormSchema>;

export default function Blockouts() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBlockout, setEditingBlockout] = useState<Blockout>();
  const [selectedBlockoutId, setSelectedBlockoutId] = useState<string | null>(
    null
  );
  const [isBlockoutDetailsModalOpen, setIsBlockoutDetailsModalOpen] =
    useState(false);

  // useCallback
  const isUserAdmin = useCallback(() => user?.role === "admin", [user]);

  // Fetch user's blockouts
  const { data: blockoutData, isLoading: isBlockoutLoading } = useQuery<{ data: Blockout[] }>({
    queryKey: ["/api/blockouts"],
    retry: false,
  });

  // Fetch users
  const { data: userData, isLoading: isUserLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    retry: false,
  });



  // Form setup
  const form = useForm<BlockoutFormData>({
    resolver: zodResolver(blockoutFormSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  // Get blockouts
  const blockouts = blockoutData?.data ?? [];

  // Create blockout mutation
  const createBlockoutMutation = useMutation({
    mutationFn: async (data: InsertBlockout) => {
      const response = await apiRequest("POST", "/api/blockouts", data);
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["/api/blockouts"] });
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
      void queryClient.invalidateQueries({ queryKey: ["/api/blockouts"] });
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
      void queryClient.invalidateQueries({ queryKey: ["/api/blockouts"] });
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

  const onSubmit = (data: BlockoutFormData) => {
    const blockoutData: InsertBlockout = {
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      reason: data.reason,
      userId: data.userId || user?.id,
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
  const sortedBlockouts = [...blockouts].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const getFormattedDate = (date: Date) => {
    // return string in format Nov 26, 2025
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath="/blockouts" />

      <div className="lg:ml-64">
        <TopNavBar title="My Blockouts" />

        {isBlockoutLoading && isUserLoading ?
          <LoadingSpinner /> :
          <main className="p-4 lg:p-4 pt-20 lg:pt-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {/* Title */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    My Blockouts
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
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
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
                              {userData?.map((user) => (
                                <SelectItem
                                  key={user.id}
                                  value={user.id.toString()}
                                >
                                  {user.firstName} {user.lastName} ({user.email})
                                </SelectItem>
                              ))}
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
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
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
                  // const isFuture = new Date() < startDate;

                  return (
                    <Card
                      key={blockout.id}
                      className="glass-card cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        setSelectedBlockoutId(blockout.id);
                        setIsBlockoutDetailsModalOpen(true);
                      }}
                    >
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {getFormattedDate(startDate)} to{" "}
                                {getFormattedDate(endDate)}
                              </h3>
                              <Badge
                                variant={
                                  isActive
                                    ? "destructive"
                                    : isPast
                                      ? "secondary"
                                      : "default"
                                }
                              >
                                {isActive
                                  ? "Active"
                                  : isPast
                                    ? "Past"
                                    : "Upcoming"}
                              </Badge>
                            </div>

                            {blockout.userId && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Created by <BlockoutUserDisplay userId={blockout.userId} createdAt={blockout.createdAt} />
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(blockout);
                              }}
                              disabled={isPast}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>}
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
