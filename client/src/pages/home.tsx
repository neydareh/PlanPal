import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  Music, 
  Clock, 
  Plus, 
  CalendarPlus,
  ArrowRight,
  Church,
  Heart
} from "lucide-react";
import { Link } from "wouter";
import type { Event, User, Song } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();

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

  // Fetch dashboard data
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: songs = [] } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  if (!isAuthenticated || !user) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  // Calculate analytics
  const today = new Date();
  const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingEvents = events.filter(event => 
    new Date(event.date) >= today && new Date(event.date) <= thisWeek
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath="/" />
      
      <div className="lg:ml-64">
        <TopNavBar title="Dashboard" />
        
        <main className="p-4 lg:p-4 lg:p-6 pt-20 lg:pt-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-4 lg:gap-4 lg:p-6 mb-6 lg:mb-6 lg:mb-8">
            <Card className="glass-card">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30">
                    <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {upcomingEvents.length} upcoming
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">this week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-accent-100 dark:bg-accent-900/30">
                    <Users className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Role</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    {user.role === 'admin' ? 'Full Access' : 'Member Access'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {user.role === 'admin' && (
              <Card className="glass-card">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-secondary-100 dark:bg-secondary-900/30">
                      <Music className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Songs in Library</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{songs.length}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Ready to use</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="glass-card">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingEvents.length}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    {upcomingEvents.filter(e => 
                      new Date(e.date).toDateString() === today.toDateString()
                    ).length} today
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions and Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-4 lg:gap-4 lg:p-6 mb-6 lg:mb-6 lg:mb-8">
            {/* Quick Actions */}
            <Card className="glass-card">
              <CardContent className="p-4 lg:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
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

                  {user.role === 'admin' && (
                    <Link href="/songs">
                      <Button className="w-full justify-between bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700">
                        <span className="flex items-center">
                          <Music className="w-4 h-4 mr-3" />
                          Song Library
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="lg:col-span-2 glass-card">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
                  <Link href="/calendar">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>

                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No upcoming events this week</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-lg border-l-4 border-primary-500 ">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                            <Church className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                          {event.description && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{event.description}</p>
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
                    {user.role === 'admin' 
                      ? "As an admin, you can create events, manage the song library, and view all team member availability."
                      : "You can view the calendar, manage your personal blockouts, and stay updated on upcoming events."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
