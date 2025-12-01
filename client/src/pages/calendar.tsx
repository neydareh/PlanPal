import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import CreateEventModal from "@/components/CreateEventModal";
import EventDetailsModal from "@/components/EventDetailsModal";
import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Event, Blockout } from "@shared/schema";
import { CalendarGrid } from "@/components/CalendarGrid";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Calendar() {
  const { user } = useAuth();
  // const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);

  // Calculate calendar dates
  // const year = currentDate.getFullYear();
  // const month = currentDate.getMonth();
  // const firstDay = new Date(year, month, 1);
  // const lastDay = new Date(year, month + 1, 0);
  // const startDate = new Date(firstDay);
  // startDate.setDate(startDate.getDate() - firstDay.getDay());
  // const endDate = new Date(lastDay);
  // endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  // Fetch events for current month
  const { data: eventsData, isLoading: isLoadingEvents } = useQuery<{ data: Event[] }>({
    queryKey: ["/api/events"],
    retry: false,
  });

  const events = eventsData?.data || [];

  // Fetch blockouts for current month
  const { data: blockoutsData, isLoading: isLoadingBlockouts } = useQuery<{ data: Blockout[] }>({
    queryKey: ["/api/blockouts"],
    retry: false,
  });

  const blockouts = blockoutsData?.data || [];

  // Generate calendar days
  // const calendarDays = [];
  // const current = new Date(startDate);
  // while (current <= endDate) {
  //   calendarDays.push(new Date(current));
  //   current.setDate(current.getDate() + 1);
  // }

  // Helper functions
  // const isCurrentMonth = (date: Date) => date.getMonth() === month;
  // const isToday = (date: Date) => {
  //   const today = new Date();
  //   return date.toDateString() === today.toDateString();
  // };

  // const getEventsForDate = (date: Date) => {
  //   return events.filter((event) => {
  //     const eventDate = new Date(event.date);
  //     return eventDate.toDateString() === date.toDateString();
  //   });
  // };

  // const getBlockoutsForDate = (date: Date) => {
  //   return blockouts.filter((blockout) => {
  //     const start = new Date(blockout.startDate);
  //     const end = new Date(blockout.endDate);
  //     return date >= start && date <= end;
  //   });
  // };

  // const navigateMonth = (direction: "prev" | "next") => {
  //   setCurrentDate((prev) => {
  //     const newDate = new Date(prev);
  //     newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
  //     return newDate;
  //   });
  // };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath="/calendar" />

      <div className="lg:ml-64">
        <TopNavBar title="Calendar" />

        {isLoadingEvents && isLoadingBlockouts ? (
          <LoadingSpinner fullScreen />
        ) : (
          <main className="p-4 lg:p-4 lg:p-6 pt-20 lg:pt-6">
            <Card className="glass-card">
              <CardContent className="p-4 lg:p-6">
                <CalendarGrid
                  events={events}
                  blockouts={blockouts}
                  user={user}
                  onCreateEventClick={() => setIsCreateEventModalOpen(true)}
                  onEventClick={(eventId) => {
                    setSelectedEventId(eventId);
                    setIsEventDetailsModalOpen(true);
                  }}
                />

                {/* Legend */}
                <div className="flex items-center space-x-6 mt-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary-100 dark:bg-primary-900/30 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Events
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Blockouts
                    </span>
                  </div>
                  {/* <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-primary-500 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Today
                  </span>
                </div> */}
                </div>
              </CardContent>
            </Card>
          </main>
        )}
      </div>

      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
      />

      <EventDetailsModal
        isOpen={isEventDetailsModalOpen}
        onClose={() => {
          setIsEventDetailsModalOpen(false);
          setSelectedEventId(null);
        }}
        eventId={selectedEventId}
      />
    </div>
  );
}
