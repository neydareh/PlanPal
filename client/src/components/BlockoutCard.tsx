import { Badge, Button, Card, CardContent } from "@neydareh/ui";
import { Edit } from "lucide-react";
import { BlockoutUserDisplay } from "./BlockoutUserDisplay";
import { Dispatch, SetStateAction } from "react";
import { Blockout } from "@/types/blockout";

interface IBlockoutCardProps {
  blockout: Blockout;
  isActive: boolean;
  isPast: boolean;
  startDate: Date;
  endDate: Date;
  handleEdit: (blockout: Blockout) => void;
  setSelectedBlockoutId: Dispatch<SetStateAction<string | null>>;
  setIsBlockoutDetailsModalOpen: Dispatch<SetStateAction<boolean>>;
}

const getFormattedDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const BlockoutCard = ({
  blockout,
  startDate,
  endDate,
  isActive,
  isPast,
  handleEdit,
  setSelectedBlockoutId,
  setIsBlockoutDetailsModalOpen,
}: IBlockoutCardProps) => {
  return (
    <Card
      key={blockout.id}
      className="glass-card cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => {
        setSelectedBlockoutId(blockout.id);
        setIsBlockoutDetailsModalOpen(true);
      }}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {blockout.userId ? (
              <p className="text-base font-semibold  text-gray-900 dark:text-white">
                Created by{" "}
                <BlockoutUserDisplay
                  userId={blockout.userId}
                  createdAt={blockout.createdAt}
                />
              </p>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Creator unavailable
              </span>
            )}
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  isActive ? "destructive" : isPast ? "secondary" : "default"
                }
              >
                {isActive ? "Active" : isPast ? "Past" : "Upcoming"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(blockout);
                }}
                disabled={isPast}
              >
                Edit
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {getFormattedDate(startDate)} to {getFormattedDate(endDate)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Tap to view details
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
