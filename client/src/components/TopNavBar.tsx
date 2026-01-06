import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@planpal/ui";
import { Input } from "@planpal/ui";
import { Search, Bell, Moon, Sun } from "lucide-react";

interface TopNavBarProps {
  title: string;
}

export default function TopNavBar({ title }: TopNavBarProps) {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleDarkMode = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newDarkMode = html.classList.contains('dark');
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 lg:static fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white ml-12 lg:ml-0">{title}</h2>
          <div className="hidden lg:block">
            <div className="ml-4 lg:ml-10 flex items-baseline space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Welcome back, {user?.firstName || user?.email || 'User'}!
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Search Bar */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              className="pl-10 w-64"
              placeholder="Search..."
            />
          </div>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="p-2"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="p-2 relative hidden sm:flex">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              3
            </span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
