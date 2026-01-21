import { Button, Card, CardContent } from "@neydareh/ui";
import { Link } from "wouter";

export const SelectOrg = () => {
  return (
    <main className="p-4 lg:p-6 pt-20 lg:pt-6">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Select an organization
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Choose an organization to view the shared dashboard, songs, and
            blockouts.
          </p>
          <Link href="/orgs">
            <Button className="bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
              Go to Organizations
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
};
