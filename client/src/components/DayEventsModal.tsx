import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Event } from "@shared/schema";
import { format } from "date-fns";
import { Clock } from "lucide-react";

interface DayEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  events: Event[];
  onEventClick: (eventId: string) => void;
}

export function DayEventsModal({
  isOpen,
  onClose,
  date,
  events,
  onEventClick,
}: DayEventsModalProps) {
  if (!date) return null;

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Events for {format(date, "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {events.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No events scheduled for this day.
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  onEventClick(event.id);
                  onClose();
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {event.title}
                  </h4>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(event.date)}
                  </div>
                </div>
                {event.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
