import { Users } from "lucide-react";
import { Card, CardContent } from "@planpal/ui";
import { User } from "@shared/schema";

const RoleIndicator = ({ user }: { user: User }) => {
  return (
    <Card className="glass-card">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-accent-100 dark:bg-accent-900/30">
            <Users className="w-5 h-5 text-accent-600 dark:text-accent-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Your Role
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {user.role}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
            {user.role === "admin" ? "Full Access" : "Member Access"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleIndicator;
