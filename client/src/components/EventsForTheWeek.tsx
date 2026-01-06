import { Clock } from "lucide-react";
import { Card, CardContent } from "@planpal/ui";
import type { Event } from "@shared/schema";

const EventsForTheWeek = ({
  upcomingEvents,
  today,
}: {
  upcomingEvents: Event[];
  today: Date;
}) => {
  return (
    <Card className="glass-card">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              This Week
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {upcomingEvents.length}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
            {
              upcomingEvents.filter(
                (e) => new Date(e.date).toDateString() === today.toDateString()
              ).length
            }{" "}
            today
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventsForTheWeek;
