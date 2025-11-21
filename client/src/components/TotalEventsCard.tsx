import { Calendar } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import type { Event } from "@shared/schema";

const TotalEventsCard = ({
  events,
  upcomingEvents,
}: {
  events: Event[];
  upcomingEvents: Event[];
}) => {
  return (
    <Card className="glass-card">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30">
            <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Events
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {events.length}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            {upcomingEvents.length} upcoming
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
            this week
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalEventsCard;
