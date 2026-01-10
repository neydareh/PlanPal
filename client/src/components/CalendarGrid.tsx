import { Blockout, Event, User } from "@shared/schema";
import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format } from "date-fns";

import { DayEventsModal } from "./DayEventsModal";

export const CalendarGrid = ({
  events,
  blockouts,
  user,
  onCreateEventClick,
  onEventClick,
}: {
  events: Event[];
  blockouts: Blockout[];
  user: User;
  onCreateEventClick: () => void;
  onEventClick?: (eventId: string) => void;
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(
    null
  );

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return start;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const weekStart = getWeekStart(currentDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDate =
    viewMode === "month"
      ? (() => {
        const start = new Date(firstDay);
        start.setDate(start.getDate() - firstDay.getDay());
        return start;
      })()
      : weekStart;

  const endDate =
    viewMode === "month"
      ? (() => {
        const end = new Date(lastDay);
        end.setDate(end.getDate() + (6 - lastDay.getDay()));
        return end;
      })()
      : weekEnd;

  // Generate calendar days
  const calendarDays = [];
  const current = new Date(startDate);

  // Generate calendar days
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

  const todayKey = (date: Date) => {
    const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return new Date(utc).toISOString().slice(0, 10);
  };

  const getEventsForDate = (date: Date) => {
    const dayKey = todayKey(date);
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return todayKey(eventDate) === dayKey;
    });
  };

  const getBlockoutsForDate = (date: Date) => {
    const dayKey = todayKey(date);
    return blockouts.filter((blockout) => {
      const start = todayKey(new Date(blockout.startDate));
      const end = todayKey(new Date(blockout.endDate));
      return dayKey >= start && dayKey <= end;
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === "month") {
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
      } else {
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      }
      return newDate;
    });
  };

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
    <>
      <DayEventsModal
        isOpen={!!selectedDateForModal}
        onClose={() => setSelectedDateForModal(null)}
        date={selectedDateForModal}
        events={selectedDateForModal ? getEventsForDate(selectedDateForModal) : []}
        onEventClick={(eventId) => onEventClick?.(eventId)}
      />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {viewMode === "month"
              ? `${monthNames[month]} ${year}`
              : `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNames[weekEnd.getMonth()]
              } ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`}
          </h2>
        </div>

        {/* Button Group */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              setCurrentDate(new Date());
            }}
          >
            Today
          </Button>

          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              setViewMode("week");
            }}
          >
            Week
          </Button>

          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              setViewMode("month");
            }}
          >
            Month
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigateMonth("prev");
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigateMonth("next");
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {user.role === "admin" && (
            <Button
              onClick={onCreateEventClick}
              className="bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className={`grid gap-1 mb-4 w-full p-1 ${viewMode === "week" ? "grid-cols-1 sm:grid-cols-7" : "grid-cols-7"
            }`}
        >
          {/* Days of week header */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className={`p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 ${viewMode === "week" ? "hidden sm:block" : ""
                }`}
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date) => {
            const dayEvents = getEventsForDate(date);
            const dayBlockouts = getBlockoutsForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDay = isToday(date);
            const dayKey = todayKey(date);

            return (
              <div
                key={dayKey}
                className={`min-h-28 p-2 border border-gray-200 dark:border-gray-600 rounded-lg transition-all duration-200 hover:shadow-md flex flex-col 
                  ${isCurrentMonthDay
                    ? "bg-white dark:bg-gray-700"
                    : "bg-gray-50 dark:bg-gray-800"
                  }
                  ${isTodayDay ? "ring-2 ring-primary-500" : ""}
                  ${dayBlockouts.length > 0
                    ? "bg-red-50 dark:bg-red-900/20"
                    : ""
                  }
                  `}
              >
                {/* Date */}
                <div
                  className={`text-sm font-medium mb-1 ${isCurrentMonthDay
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-600"
                    } ${isTodayDay
                      ? "text-primary-600 dark:text-primary-400 font-bold"
                      : ""
                    }`}
                >
                  <span className={viewMode === "week" ? "inline sm:hidden mr-1" : "hidden"}>
                    {format(date, "EEE")}
                  </span>
                  {date.getDate()}
                </div>

                {/* Events */}
                <div className="space-y-1 flex-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-2 py-1 rounded truncate cursor-pointer transition-all duration-200 hover:bg-primary/80 dark:hover:bg-primary/70 hover:text-white dark:hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event.id);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}

                  {/* {dayBlockouts.slice(0, 1).map((blockout) => (
                    <div
                      key={blockout.id}
                      className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-1 py-0.5 rounded truncate"
                    >
                      Blockout
                    </div>
                  ))} */}

                  {dayEvents.length > 2 && (
                    <div
                      className="text-xs font-medium text-primary-600 dark:text-primary-400 cursor-pointer hover:text-primary-700 dark:hover:text-primary-300 hover:underline mt-1 px-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDateForModal(date);
                      }}
                    >
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
