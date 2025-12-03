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

  // Fetch events for current month
  const { data: eventsData, isLoading: isLoadingEvents } = useQuery<{
    data: Event[];
  }>({
    queryKey: ["/api/events"],
    retry: false,
  });

  const events = eventsData?.data ?? [];

  // Fetch blockouts for current month
  const { data: blockoutsData, isLoading: isLoadingBlockouts } = useQuery<{
    data: Blockout[];
  }>({
    queryKey: ["/api/blockouts"],
    retry: false,
  });

  const blockouts = blockoutsData?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath="/calendar" />

      <div className="lg:ml-64">
        <TopNavBar title="Calendar" />

        {isLoadingEvents && isLoadingBlockouts ? (
          <LoadingSpinner />
        ) : (
          <main className="p-4 lg:p-6 pt-20 lg:pt-6">
            <Card className="glass-card">
              <CardContent className="p-4 lg:p-6">
                <CalendarGrid
                  events={events}
                  blockouts={blockouts}
                  user={user}
                  onCreateEventClick={() => {
                    setIsCreateEventModalOpen(true);
                  }}
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
                </div>
              </CardContent>
            </Card>
          </main>
        )}
      </div>

      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => {
          setIsCreateEventModalOpen(false);
        }}
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
