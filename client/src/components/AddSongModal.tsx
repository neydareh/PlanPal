import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSongSchema } from "@shared/schema";
import type { InsertSong } from "@shared/schema";
import { z } from "zod";

const songFormSchema = insertSongSchema.extend({
  youtubeUrl: z
    .string()
    .url("Please enter a valid YouTube URL")
    .optional()
    .or(z.literal("")),
});

type SongFormData = z.infer<typeof songFormSchema>;

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSongModal({ isOpen, onClose }: AddSongModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<SongFormData>({
    resolver: zodResolver(songFormSchema),
    defaultValues: {
      title: "",
      artist: "",
      key: "",
      youtubeUrl: "",
    },
    mode: "onChange",
  });

  // Create song mutation
  const createSongMutation = useMutation({
    mutationFn: async (data: InsertSong) => {
      const response = await apiRequest("POST", "/api/songs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({
        title: "Success",
        description: "Song added successfully!",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add song. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SongFormData) => {
    const songData: InsertSong = {
      title: data.title,
      artist: data.artist || null,
      key: data.key || null,
      youtubeUrl: data.youtubeUrl || null,
      createdBy: user!.id,
    };

    createSongMutation.mutate(songData);
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const musicKeys = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ].filter(Boolean); // Remove any falsy values

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Song</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Song Title *</Label>
            <Input
              id="title"
              placeholder="Enter song title"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="artist">Artist</Label>
            <Input
              id="artist"
              placeholder="Enter artist name (optional)"
              {...form.register("artist")}
            />
            {form.formState.errors.artist && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.artist.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="key">Key</Label>
            <Select
              value={form.watch("key") || ""}
              onValueChange={(value) => {
                form.setValue("key", value === "" ? "" : value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select key (optional)" />
              </SelectTrigger>
              <SelectContent>
                {musicKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.key && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.key.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input
              id="youtubeUrl"
              placeholder="https://www.youtube.com/watch?v=... (optional)"
              {...form.register("youtubeUrl")}
            />
            {form.formState.errors.youtubeUrl && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.youtubeUrl.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSongMutation.isPending}>
              {createSongMutation.isPending ? "Adding..." : "Add Song"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
