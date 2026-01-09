import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import { Button, Badge, Card, CardContent } from "@neydareh/ui";

import {
  Calendar,
  Music,
  CalendarPlus,
  ArrowRight,
  Church,
  Heart,
} from "lucide-react";
import { Link } from "wouter";
import type { Event, Song } from "@shared/schema";
import { useEffect, useState } from "react";
import RoleIndicator from "@/components/RoleIndicator";
import SongsInLibrary from "@/components/SongsInLibrary";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PaginatedResult } from "@server/utils/pagination";

export default function Home() {
  const { isLoading, user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  // Fetch dashboard data
  const { isLoading: isLoadingEvents, data: events } = useQuery<PaginatedResult<Event>>({
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
        (event) => new Date(event.date) >= today && new Date(event.date) <= thisWeek
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
              {/* Quick Actions */}
              <Card className="glass-card">
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Link href="/calendar">
                      <Button className="w-full justify-between bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-3" />
                          View Calendar
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>

                    <div className="my-2"></div>

                    <Link href="/blockouts">
                      <Button className="w-full justify-between bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700">
                        <span className="flex items-center">
                          <CalendarPlus className="w-4 h-4 mr-3" />
                          Manage Blockouts
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>

                    {user.role === "admin" && (
                      <>
                        <div className="my-2"></div>
                        <Link href="/songs">
                          <Button className="w-full justify-between bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700">
                            <span className="flex items-center">
                              <Music className="w-4 h-4 mr-3" />
                              Song Library
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card className="lg:col-span-2 glass-card">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Upcoming Events
                    </h3>
                    <Link href="/calendar">
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>

                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No upcoming events this week
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-lg border-l-4 border-primary-500 "
                        >
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                              <Church className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {event.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(event.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                            {event.description && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <Badge variant="secondary">Event</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Welcome Message */}
            <Card className="glass-card">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
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
