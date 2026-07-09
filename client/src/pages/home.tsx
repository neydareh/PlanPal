import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PaginatedResult } from "@server/utils/pagination";
import TopNavBar from "@/components/TopNavBar";
import Sidebar from "@/components/Sidebar";
import { Event, Song } from "@/types";
import { Homepage } from "@/components/Homepage";

export default function Home() {
  const { isLoading, user } = useAuthContext();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  const { isLoading: isLoadingEvents, data: events } = useQuery<
    PaginatedResult<Event>
  >({
    queryKey: ["/api/events"],
    retry: false,
  });

  const { isLoading: isLoadingSongs, data: songs = [] } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
    retry: false,
  });

  const today = new Date();
  const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    if (!isLoadingEvents && events && events.data.length > 0) {
      const filteredEvents = events.data.filter(
        (event) =>
          new Date(event.date) >= today && new Date(event.date) <= thisWeek,
      );
      setUpcomingEvents(filteredEvents);
    }
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath="/" />

      <div className="lg:ml-64">
        <TopNavBar title="Dashboard" />

        {isLoading && isLoadingEvents && isLoadingSongs ? (
          <LoadingSpinner />
        ) : (
          <Homepage user={user!} songs={songs} upcomingEvents={upcomingEvents} />
        )}
      </div>
    </div>
  );
}
