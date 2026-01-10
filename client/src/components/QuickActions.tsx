import { Link } from "wouter";
import { Calendar, CalendarPlus, ArrowRight, Music } from "lucide-react";
import type { User } from "@shared/schema";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type QuickActionsProps = {
  role: string;
};

export default function QuickActions({ role }: QuickActionsProps) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="space-y-3">
          <Link href="/calendar">
            <Button className="w-full justify-between bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-3" />
                View Calendar
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <div className="my-2"></div>

          <Link href="/blockouts">
            <Button className="w-full justify-between bg-linear-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700">
              <span className="flex items-center">
                <CalendarPlus className="w-4 h-4 mr-3" />
                Manage Blockouts
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          {role === "admin" && (
            <>
              <div className="my-2"></div>
              <Link href="/songs">
                <Button className="w-full justify-between bg-linear-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700">
                  <span className="flex items-center">
                    <Music className="w-4 h-4 mr-3" />
                    Song Library
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
