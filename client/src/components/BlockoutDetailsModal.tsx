import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@neydareh/ui";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@neydareh/ui";
import { Button } from "@neydareh/ui";
import { Badge } from "@neydareh/ui";
import { Calendar, Clock, Trash2, User } from "lucide-react";
import type { Blockout, User as UserType } from "@shared/schema";

interface BlockoutDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockoutId: string | null;
}

export default function BlockoutDetailsModal({
  isOpen,
  onClose,
  blockoutId,
}: BlockoutDetailsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch blockout details
  const { data: blockout, isLoading } = useQuery<Blockout>({
    queryKey: ["/api/blockouts", blockoutId],
    queryFn: async () => {
      if (!blockoutId) return null;
      const response = await apiRequest("GET", `/api/blockouts/${blockoutId}`);
      return response.json();
    },
    enabled: isOpen && !!blockoutId,
    retry: false,
  });

  // Fetch user details
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/users", blockout?.userId],
    queryFn: async () => {
      if (!blockout?.userId) return null;
      const response = await apiRequest("GET", `/api/users/${blockout.userId}`);
      return response.json();
    },
    enabled: isOpen && !!blockout?.userId,
    retry: false,
  });

  // Delete blockout mutation
  const deleteBlockoutMutation = useMutation({
    mutationFn: async () => {
      if (!blockoutId) return;
      await apiRequest("DELETE", `/api/blockouts/${blockoutId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["/api/blockouts"] });
      toast({
        title: "Success",
        description: "Blockout deleted successfully!",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete blockout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this blockout?")) {
      deleteBlockoutMutation.mutate();
    }
  };

  const formatDate = (dateString: string | Date) => {
    // Parse the date string and create a date in local timezone
    const date = new Date(dateString);

    // For dates that are stored as date-only (YYYY-MM-DD), we need to treat them as local dates
    // Check if the input is a date-only string (no time component)
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // Create a local date by parsing the components
      const [year, month, day] = dateString.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);

      return localDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // For datetime strings, use the date as-is
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDuration = (startDate: string | Date, endDate: string | Date) => {
    // Parse dates in local timezone
    const parseLocalDate = (dateString: string | Date) => {
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(dateString);
    };

    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays;
  };

  const getBlockoutStatus = (startDate: string | Date, endDate: string | Date) => {
    // Parse dates in local timezone
    const parseLocalDate = (dateString: string | Date) => {
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(dateString);
    };

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for comparison

    const start = parseLocalDate(startDate);
    start.setHours(0, 0, 0, 0);

    const end = parseLocalDate(endDate);
    end.setHours(23, 59, 59, 999); // Set to end of day

    if (now >= start && now <= end) {
      return { label: "Active", variant: "destructive" as const };
    } else if (now > end) {
      return { label: "Past", variant: "secondary" as const };
    } else {
      return { label: "Upcoming", variant: "default" as const };
    }
  };

  if (!isOpen || !blockoutId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Blockout Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 dark:text-gray-400">Loading blockout details...</div>
          </div>
        ) : blockout ? (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge {...getBlockoutStatus(blockout.startDate, blockout.endDate)}>
                {getBlockoutStatus(blockout.startDate, blockout.endDate).label}
              </Badge>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {calculateDuration(blockout.startDate, blockout.endDate)} day
                {calculateDuration(blockout.startDate, blockout.endDate) > 1 ? "s" : ""}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(blockout.startDate)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(blockout.endDate)}</p>
                </div>
              </div>
            </div>

            {/* Reason */}
            {blockout.reason && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Reason
                </p>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {blockout.reason}
                </p>
              </div>
            )}

            {/* User Details */}
            {user && (
              <div>
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email || "Unknown User"}
                    </p>
                    {user.firstName && user.lastName && user.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    )}
                    {user.role && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {user.role}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>
                Created {blockout.createdAt ? formatDate(blockout.createdAt) : "Unknown date"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button
                onClick={handleDelete}
                disabled={deleteBlockoutMutation.isPending}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteBlockoutMutation.isPending ? "Deleting..." : "Delete Blockout"}
              </Button>
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 dark:text-gray-400">Blockout not found</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
