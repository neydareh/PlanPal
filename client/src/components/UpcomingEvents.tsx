import { Link } from "wouter";
import { Calendar, Church, ChevronDown } from "lucide-react";
import type { Event } from "@shared/schema";

import { Card, CardContent, Button, Badge } from "@neydareh/ui";

type UpcomingEventsProps = {
  events: Event[];
};

const NoUpcomingEvents = () => {
  return (
    <div className="text-center py-8">
      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-400">
        No upcoming events this week
      </p>
    </div>
  );
};

const Events = ({ events }: UpcomingEventsProps) => {
  return (
    <div className="relative">
      <div className="max-h-50 space-y-4 overflow-y-auto pr-2">
        {events.slice(0, 7).map((event) => (
          <div
            key={event.id}
            className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-lg border-l-4 border-primary-500 "
          >
            <div className="shrink-0">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <Church className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {event.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              {event.description && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {event.description}
                </p>
              )}
            </div>
            <div className="shrink-0">
              <Badge variant="secondary">Event</Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-b from-transparent to-white/90 dark:to-gray-700/90" />
      <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center text-gray-400 dark:text-gray-300">
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>
    </div>
  );
};

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
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

        {events.length === 0 ? (
          <NoUpcomingEvents />
        ) : (
          <Events events={events} />
        )}
      </CardContent>
    </Card>
  );
}
