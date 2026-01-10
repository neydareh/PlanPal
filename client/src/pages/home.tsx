import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import type { Event, Song } from "@shared/schema";
import { useEffect, useState } from "react";
// import TotalEventsCard from "@/components/TotalEventsCard";
import RoleIndicator from "@/components/RoleIndicator";
import SongsInLibrary from "@/components/SongsInLibrary";
import QuickActions from "@/components/QuickActions";
import UpcomingEvents from "@/components/UpcomingEvents";
// import EventsForTheWeek from "@/components/EventsForTheWeek";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PaginatedResult } from "@server/utils/pagination";

export default function Home() {
  const { isLoading, user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  // Fetch dashboard data
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

  // Calculate analytics
  const today = new Date();
  const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Set upcoming events
  useEffect(() => {
    if (!isLoadingEvents && events && events.data.length > 0) {
      const filteredEvents = events.data.filter(
        (event) =>
          new Date(event.date) >= today && new Date(event.date) <= thisWeek
      );
      setUpcomingEvents(filteredEvents);
    }
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath="/" />

      <div className="lg:ml-64">
        <TopNavBar title="Dashboard" />

        {/* render loading state */}
        {isLoading && isLoadingEvents && isLoadingSongs ? (
          <LoadingSpinner />
        ) : (
          <main className="p-4 lg:p-6 pt-20 lg:pt-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-4 lg:p-6 mb-6 lg:mb-6">
              {/* <TotalEventsCard
                events={events}
                upcomingEvents={upcomingEvents}
              /> */}
              <RoleIndicator user={user} />
              {user.role === "admin" && <SongsInLibrary songs={songs} />}

              {/* <EventsForTheWeek upcomingEvents={upcomingEvents} today={today} /> */}
            </div>

            {/* Quick Actions and Upcoming Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-4lg:p-6 mb-6 lg:mb-6">
              <QuickActions role={user.role} />
              <UpcomingEvents events={upcomingEvents} />
            </div>

            {/* Welcome Message */}
            <Card className="glass-card">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-linear-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Welcome back, {user.firstName || user.email}!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user.role === "admin"
                        ? "As an admin, you can create events, manage the song library, and view all team member availability."
                        : "You can view the calendar, manage your personal blockouts, and stay updated on upcoming events."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        )}
      </div>
    </div>
  );
}
