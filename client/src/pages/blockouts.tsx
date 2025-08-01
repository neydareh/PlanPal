import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, Trash2, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBlockoutSchema } from "@shared/schema";
import type { Blockout, InsertBlockout } from "@shared/schema";
import { z } from "zod";

const blockoutFormSchema = insertBlockoutSchema.extend({
  startDate: z.string(),
  endDate: z.string(),
});

type BlockoutFormData = z.infer<typeof blockoutFormSchema>;

export default function Blockouts() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBlockout, setEditingBlockout] = useState<Blockout | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user's blockouts
  const { data: blockouts = [], error: blockoutsError } = useQuery<Blockout[]>({
    queryKey: ["/api/blockouts"],
    enabled: isAuthenticated,
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

  // Create blockout mutation
  const createBlockoutMutation = useMutation({
    mutationFn: async (data: InsertBlockout) => {
      const response = await apiRequest("POST", "/api/blockouts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blockouts"] });
      toast({
        title: "Success",
        description: "Blockout created successfully!",
      });
      setIsCreateModalOpen(false);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create blockout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update blockout mutation
  const updateBlockoutMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBlockout> }) => {
      const response = await apiRequest("PUT", `/api/blockouts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blockouts"] });
      toast({
        title: "Success",
        description: "Blockout updated successfully!",
      });
      setEditingBlockout(null);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
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
      queryClient.invalidateQueries({ queryKey: ["/api/blockouts"] });
      toast({
        title: "Success",
        description: "Blockout deleted successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete blockout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle errors
  useEffect(() => {
    if (blockoutsError && isUnauthorizedError(blockoutsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [blockoutsError, toast]);

  const onSubmit = (data: BlockoutFormData) => {
    const blockoutData: InsertBlockout = {
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      reason: data.reason,
      userId: user!.id,
    };

    if (editingBlockout) {
      updateBlockoutMutation.mutate({ id: editingBlockout.id, data: blockoutData });
    } else {
      createBlockoutMutation.mutate(blockoutData);
    }
  };

  const handleEdit = (blockout: Blockout) => {
    setEditingBlockout(blockout);
    form.reset({
      startDate: new Date(blockout.startDate).toISOString().split('T')[0],
      endDate: new Date(blockout.endDate).toISOString().split('T')[0],
      reason: blockout.reason || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingBlockout(null);
    form.reset();
  };

  if (!isAuthenticated || !user) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  // Sort blockouts by start date
  const sortedBlockouts = [...blockouts].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath="/blockouts" />
      
      <div className="ml-64">
        <TopNavBar title="My Blockouts" />
        
        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Blockouts</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your unavailable dates
                </p>
              </div>
              <Dialog open={isCreateModalOpen} onOpenChange={handleCloseModal}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Blockout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingBlockout ? 'Edit Blockout' : 'Create New Blockout'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <Button type="button" variant="outline" onClick={handleCloseModal}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createBlockoutMutation.isPending || updateBlockoutMutation.isPending}
                      >
                        {editingBlockout ? 'Update' : 'Create'} Blockout
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
                  onClick={() => setIsCreateModalOpen(true)}
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
                const isActive = new Date() >= startDate && new Date() <= endDate;
                const isPast = new Date() > endDate;
                const isFuture = new Date() < startDate;
                
                return (
                  <Card key={blockout.id} className="glass-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                            </h3>
                            <Badge variant={isActive ? "destructive" : isPast ? "secondary" : "default"}>
                              {isActive ? "Active" : isPast ? "Past" : "Upcoming"}
                            </Badge>
                          </div>
                          
                          {blockout.reason && (
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                              {blockout.reason}
                            </p>
                          )}
                          
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Created {blockout.createdAt ? new Date(blockout.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(blockout)}
                            disabled={isPast}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBlockoutMutation.mutate(blockout.id)}
                            disabled={deleteBlockoutMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
