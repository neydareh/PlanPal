import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import CreateEventModal from "@/components/CreateEventModal";
import EventDetailsModal from "@/components/EventDetailsModal";
import { Button, Card, CardContent } from "@neydareh/ui";
import type { Event, Blockout } from "@shared/schema";
import { CalendarGrid } from "@/components/CalendarGrid";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useOrgContext } from "@/hooks/useOrgContext";
import { Link } from "wouter";

export default function Calendar() {
  const { user } = useAuth();
  const { orgId } = useOrgContext();
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);

  const { data: eventsData, isLoading: isLoadingEvents } = useQuery<{
    data: Event[];
  }>({
    queryKey: ["/api/events"],
    retry: false,
  });

  const events = eventsData?.data ?? [];

  const { data: blockoutsData, isLoading: isLoadingBlockouts } = useQuery<{
    data: Blockout[];
  }>({
    queryKey: ["/api/blockouts"],
    retry: false,
  });

  const blockouts = blockoutsData?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath={"/calendar"} />

      <div className="lg:ml-64">
        <TopNavBar title="Calendar" />

        {isLoadingEvents && isLoadingBlockouts ? (
          <LoadingSpinner />
        ) : !orgId ? (
          <main className="p-4 lg:p-6 pt-20 lg:pt-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select an organization
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Choose an organization to view the shared calendar.
                </p>
                <Link href="/orgs">
                  <Button className="bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                    Go to Organizations
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        ) : (
          <main className="p-4 lg:p-6 pt-20 lg:pt-6">
            <Card className="glass-card">
              <CardContent className="p-4 lg:p-6">
                <CalendarGrid
                  events={events}
                  blockouts={blockouts}
                  user={user!}
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
