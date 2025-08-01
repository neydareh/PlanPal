import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import CreateEventModal from "@/components/CreateEventModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Event, Blockout } from "@shared/schema";

export default function Calendar() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);

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

  // Calculate calendar dates
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  // Fetch events for current month
  const { data: events = [], error: eventsError } = useQuery<Event[]>({
    queryKey: ["/api/events", startDate.toISOString(), endDate.toISOString()],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch blockouts for current month
  const { data: blockouts = [], error: blockoutsError } = useQuery<Blockout[]>({
    queryKey: ["/api/blockouts", startDate.toISOString(), endDate.toISOString(), "all"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Handle errors
  useEffect(() => {
    if (eventsError && isUnauthorizedError(eventsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [eventsError, toast]);

  if (!isAuthenticated || !user) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  // Generate calendar days
  const calendarDays = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Helper functions
  const isCurrentMonth = (date: Date) => date.getMonth() === month;
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getBlockoutsForDate = (date: Date) => {
    return blockouts.filter(blockout => {
      const start = new Date(blockout.startDate);
      const end = new Date(blockout.endDate);
      return date >= start && date <= end;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPath="/calendar" />
      
      <div className="lg:ml-64">
        <TopNavBar title="Calendar" />
        
        <main className="p-4 lg:p-4 lg:p-6 pt-20 lg:pt-6">
          <Card className="glass-card">
            <CardContent className="p-4 lg:p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {monthNames[month]} {year}
                  </h2>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  {user.role === 'admin' && (
                    <Button
                      onClick={() => setIsCreateEventModalOpen(true)}
                      className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Days of week header */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((date, index) => {
                  const dayEvents = getEventsForDate(date);
                  const dayBlockouts = getBlockoutsForDate(date);
                  const isCurrentMonthDay = isCurrentMonth(date);
                  const isTodayDay = isToday(date);

                  return (
                    <div
                      key={index}
                      className={`h-24 p-2 border border-gray-200 dark:border-gray-600 rounded-lg transition-all duration-200 hover:scale-102 hover:shadow-md ${
                        isCurrentMonthDay 
                          ? 'bg-white dark:bg-gray-700' 
                          : 'bg-gray-50 dark:bg-gray-800'
                      } ${
                        isTodayDay ? 'ring-2 ring-primary-500' : ''
                      } ${
                        dayBlockouts.length > 0 ? 'bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                    >
                      <div className={`text-sm font-medium ${
                        isCurrentMonthDay 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-400 dark:text-gray-600'
                      } ${
                        isTodayDay ? 'text-primary-600 dark:text-primary-400 font-bold' : ''
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-1 py-0.5 rounded truncate"
                          >
                            {event.title}
                          </div>
                        ))}
                        
                        {dayBlockouts.slice(0, 1).map((blockout) => (
                          <div
                            key={blockout.id}
                            className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-1 py-0.5 rounded truncate"
                          >
                            Blockout
                          </div>
                        ))}
                        
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-6 mt-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary-100 dark:bg-primary-900/30 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Events</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Blockouts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-primary-500 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
      />
    </div>
  );
}
