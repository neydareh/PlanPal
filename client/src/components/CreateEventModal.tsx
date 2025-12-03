import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema } from "@shared/schema";
import type { Song, InsertEvent, Blockout } from "@shared/schema";
import { z } from "zod";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const eventFormSchema = insertEventSchema.omit({ createdBy: true }).extend({
  date: z.string(),
  time: z.string(),
  songIds: z.array(z.string()).optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEventModal({
  isOpen,
  onClose,
}: CreateEventModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);

  // Form setup
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      songIds: [],
    },
  });

  // Fetch songs for selection
  const { data: songsData } = useQuery<{ data: Song[] }>({
    queryKey: ["/api/songs"],
    enabled: isOpen,
    retry: false,
  });
  const songs = songsData?.data ?? [];

  // Fetch blockouts to show team availability
  const { data: blockoutsData } = useQuery<{ data: Blockout[] }>({
    queryKey: ["/api/blockouts"],
    enabled: isOpen,
    retry: false,
  });
  const blockouts = blockoutsData?.data ?? [];

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: InsertEvent) => {
      console.log("Creating event:", data);
      const response = await apiRequest("POST", "/api/events", data);
      return response.json();
    },
    onSuccess: async (event) => {
      console.log("Event created successfully:", event);

      // Add selected songs to the event
      if (selectedSongs.length > 0) {
        await Promise.all(
          selectedSongs.map((songId, index) =>
            apiRequest("POST", `/api/events/${event.id}/songs`, {
              songId,
              order: (index + 1).toString(),
            })
          )
        );
      }

      void queryClient.invalidateQueries({ queryKey: ["/api/events"] });

      toast({
        title: "Success",
        description: "Event created successfully!",
      });

      handleClose();
    },
    onError: (err) => {
      console.log("error => ", err);
      // set form errors
      // form.setError("root", {
      //   type: "manual",
      //   message: "Failed to create event. Please try again.",
      // });
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    const eventDateTime = new Date(`${data.date}T${data.time}`);

    const eventData: InsertEvent = {
      title: data.title,
      description: data.description || null,
      date: eventDateTime,
      createdBy: user?.id,
    };

    createEventMutation.mutate(eventData);
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setSelectedSongs([]);
  };

  const handleSongToggle = (songId: string) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  // Get blockouts for selected date
  const selectedDate = form.watch("date");
  const getBlockoutsForDate = (dateStr: string) => {
    if (!dateStr) return [];
    const date = new Date(dateStr);
    return blockouts.filter((blockout) => {
      const start = new Date(blockout.startDate);
      const end = new Date(blockout.endDate);
      return date >= start && date <= end;
    });
  };

  const dateBlockouts = getBlockoutsForDate(selectedDate);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-screen overflow-y-auto"
        aria-describedby="create-event-modal"
      >
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* {Object.keys(form.formState.errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Please fix the errors below before submitting.
                {form.formState.errors.root && (
                  <div className="mt-1">{form.formState.errors.root.message}</div>
                )}
              </AlertDescription>
            </Alert>
          )} */}
          {/* Event title */}
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Event date and time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" {...form.register("time")} />
              {form.formState.errors.time && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.time.message}
                </p>
              )}
            </div>
          </div>

          {/* Event description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Event description (optional)"
              {...form.register("description")}
            />
          </div>

          {/* Team Availability Preview */}
          {selectedDate && (
            <div>
              <Label>Team Availability for Selected Date</Label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {dateBlockouts.length === 0 ? (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    No blockouts found for this date - all team members appear
                    available!
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                      The following team members have blockouts for this date:
                    </p>
                    {dateBlockouts.map((blockout) => (
                      <div
                        key={blockout.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-900 dark:text-white">
                          Team Member (ID: {blockout.userId})
                        </span>
                        <Badge variant="destructive">Blocked</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Song Selection */}
          <div>
            <Label>Assign Songs</Label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-48 overflow-y-auto">
              {songs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No songs available. Add songs to your library first.
                </p>
              ) : (
                songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center space-x-3 py-2"
                  >
                    <Checkbox
                      id={song.id}
                      checked={selectedSongs.includes(song.id)}
                      onCheckedChange={() => {
                        handleSongToggle(song.id);
                      }}
                    />
                    <div className="flex-1">
                      <label htmlFor={song.id} className="cursor-pointer">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {song.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {song.artist ? `${song.artist} • ` : ""}
                          {song.key ? `Key: ${song.key}` : "No key specified"}
                        </p>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
            <Button type="button" variant="destructive" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
