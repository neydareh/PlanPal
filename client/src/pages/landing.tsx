import { Button, Card, CardContent } from "@neydareh/ui";
import { Church, Calendar, Music, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
              <Church className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              ChurchFlow
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Modern ministry management made simple. Streamline your church
            scheduling, song library, and team coordination all in one beautiful
            platform.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-4 lg:p-6 mb-16">
          <Card className="glass-card">
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Smart Scheduling
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create events with automatic team availability checking and
                conflict detection.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Music className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Song Library
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Organize your worship songs with keys, YouTube links, and easy
                assignment to events.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Team Management
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track team member availability and manage personal blockouts
                effortlessly.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Church className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Modern Interface
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Beautiful, intuitive design with dark mode support and mobile
                responsiveness.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="glass-cardmax-w-lg mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Join thousands of churches already using ChurchFlow to
                streamline their ministry operations.
              </p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                size="lg"
              >
                Enter App
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
