import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import AddSongModal from "@/components/AddSongModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Play, ExternalLink, Edit, Trash2 } from "lucide-react";
import type { Song } from "@shared/schema";

export default function Songs() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [keyFilter, setKeyFilter] = useState("");
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check admin access
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "Admin access required for song management.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Fetch songs
  const { data: songs = [], error: songsError } = useQuery<Song[]>({
    queryKey: ["/api/songs", searchQuery, keyFilter],
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  // Delete song mutation
  const deleteSongMutation = useMutation({
    mutationFn: async (songId: string) => {
      await apiRequest("DELETE", `/api/songs/${songId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({
        title: "Success",
        description: "Song deleted successfully!",
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
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete song. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle errors
  useEffect(() => {
    if (songsError && isUnauthorizedError(songsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [songsError, toast]);

  if (!isAuthenticated || !user) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar currentPath="/songs" />
        <div className="ml-64">
          <TopNavBar title="Song Library" />
          <main className="p-4 lg:p-6">
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Admin Access Required
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You need admin privileges to access the song library.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const getYouTubeVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      : null;
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
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath="/songs" />

      <div className="lg:ml-64">
        <TopNavBar title="Song Library" />

        <main className="p-4 lg:p-4 lg:p-6 pt-20 lg:pt-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Song Library
              </h2>
              <Button
                onClick={() => setIsAddSongModalOpen(true)}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Song
              </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={keyFilter} onValueChange={setKeyFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Keys" />
                </SelectTrigger>
                <SelectContent>
                  {musicKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Songs Grid */}
          {songs.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery || keyFilter
                    ? "No songs match your filters"
                    : "No songs yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery || keyFilter
                    ? "Try adjusting your search criteria."
                    : "Start building your song library by adding your first song."}
                </p>
                {!searchQuery && !keyFilter && (
                  <Button
                    onClick={() => setIsAddSongModalOpen(true)}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Song
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-4 lg:p-6">
              {songs.map((song) => {
                const thumbnail = song.youtubeUrl
                  ? getYouTubeThumbnail(song.youtubeUrl)
                  : null;

                return (
                  <Card key={song.id} className="glass-card">
                    <CardContent className="p-4 lg:p-6">
                      {/* Song Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {song.title}
                          </h3>
                          {song.artist && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {song.artist}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {song.key && (
                            <Badge variant="secondary">{song.key}</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSongMutation.mutate(song.id)}
                            disabled={deleteSongMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* YouTube Thumbnail */}
                      {song.youtubeUrl && (
                        <div className="mb-4">
                          <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {thumbnail && (
                              <img
                                src={thumbnail}
                                alt={`${song.title} thumbnail`}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Button
                                size="sm"
                                className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full"
                                onClick={() =>
                                  song.youtubeUrl &&
                                  window.open(song.youtubeUrl, "_blank")
                                }
                              >
                                <Play className="w-4 h-4 ml-1 text-white" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Song Info */}
                      <div className="space-y-2 mb-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Added{" "}
                          {song.createdAt
                            ? new Date(song.createdAt).toLocaleDateString()
                            : "Unknown date"}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {song.youtubeUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              song.youtubeUrl &&
                              window.open(song.youtubeUrl, "_blank")
                            }
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <AddSongModal
        isOpen={isAddSongModalOpen}
        onClose={() => setIsAddSongModalOpen(false)}
      />
    </div>
  );
}
