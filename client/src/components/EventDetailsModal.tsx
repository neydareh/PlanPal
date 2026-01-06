import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@planpal/ui";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@planpal/ui";
import { Button } from "@planpal/ui";
import { Badge } from "@planpal/ui";
import { Calendar, Clock, Music, Users, Trash2 } from "lucide-react";
import type { Event, Song, Blockout } from "@shared/schema";
import { UserDisplay } from "@/components/UserDisplay";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
}

interface EventSongDetails extends Song {
  order: string | null;
}

export default function EventDetailsModal({
  isOpen,
  onClose,
  eventId,
}: EventDetailsModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const response = await apiRequest("GET", `/api/events/${eventId}`);
      return response.json();
    },
    enabled: isOpen && !!eventId,
    retry: false,
  });

  // Fetch event songs
  const { data: eventSongs = [] } = useQuery<EventSongDetails[]>({
    queryKey: ["/api/events", eventId, "songs"],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiRequest("GET", `/api/events/${eventId}/songs`);
      return response.json();
    },
    enabled: isOpen && !!eventId,
    retry: false,
  });

  // Fetch blockouts for the event date
  const { data: blockoutsData } = useQuery<{ data: Blockout[] }>({
    queryKey: ["/api/blockouts", event?.date],
    queryFn: async () => {
      if (!event?.date) return { data: [] };
      const response = await apiRequest(
        "GET",
        "/api/blockouts?page=1&limit=100"
      );
      return response.json();
    },
    enabled: isOpen && !!event?.date,
    retry: false,
  });

  const allBlockouts = blockoutsData?.data ?? [];

  // Filter blockouts for the event date
  const eventDateBlockouts = event?.date
    ? allBlockouts.filter((blockout) => {
      const eventDate = new Date(event.date);
      const start = new Date(blockout.startDate);
      const end = new Date(blockout.endDate);
      return eventDate >= start && eventDate <= end;
    })
    : [];

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) return;
      await apiRequest("DELETE", `/api/events/${eventId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate();
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isOpen || !eventId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Event Details</DialogTitle>
        </DialogHeader>

        {eventLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 dark:text-gray-400">
              Loading event details...
            </div>
          </div>
        ) : event ? (
          <div className="space-y-6">
            {/* Event Title */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {event.title}
              </h3>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Time
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {formatTime(event.date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Description
                </p>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Assigned Songs */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Music className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Assigned Songs ({eventSongs.length})
                </p>
              </div>
              {eventSongs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No songs assigned to this event
                </p>
              ) : (
                <div className="space-y-2">
                  {eventSongs
                    .sort((a, b) => parseInt(a.order ?? "0") - parseInt(b.order ?? "0"))
                    .map((song, index) => (
                      <div
                        key={song.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {song.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {song.artist
                              ? `${song.artist} • `
                              : ""}
                            {song.key
                              ? `Key: ${song.key}`
                              : "No key specified"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Team Availability */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Team Availability
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {eventDateBlockouts.length === 0 ? (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ No blockouts found - all team members appear available!
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                      ⚠ The following team members have blockouts for this date:
                    </p>
                    {eventDateBlockouts.map((blockout) => (
                      <div
                        key={blockout.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-900 dark:text-white">
                          <UserDisplay userId={blockout.userId} />
                        </span>
                        <Badge variant="destructive">Blocked</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {user.role === "admin" && (
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <Button
                  onClick={handleDelete}
                  disabled={deleteEventMutation.isPending}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteEventMutation.isPending
                    ? "Deleting..."
                    : "Delete Event"}
                </Button>
                <Button variant="ghost" onClick={onClose} className="flex-1">
                  Close
                </Button>
              </div>
            )}

            {user.role !== "admin" && (
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 dark:text-gray-400">
              Event not found
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
