import { Card, CardContent } from "@neydareh/ui";
import { Heart } from "lucide-react";
import QuickActions from "./QuickActions";
import RoleIndicator from "./RoleIndicator";
import SongsInLibrary from "./SongsInLibrary";
import UpcomingEvents from "./UpcomingEvents";
import { AppUser } from "@/hooks/useAuth";
import { Song, Event } from "@/types";
import TotalEventsCard from "./TotalEventsCard";

export const Homepage = ({
  user,
  songs,
  upcomingEvents,
}: {
  user: AppUser;
  songs: Song[];
  upcomingEvents: Event[];
}) => {
  return (
    <main className="p-4 lg:p-6 pt-20 lg:pt-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-4 lg:p-6 mb-6 lg:mb-6">
        {/* <TotalEventsCard
          events={upcomingEvents}
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
  );
};
