import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Church,
  Calendar,
  CalendarX,
  Music,
  Settings,
  X,
  Menu,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [currentPath]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const navItems = [
    {
      href: "/",
      icon: Church,
      label: "Dashboard",
      adminOnly: false,
    },
    {
      href: "/calendar",
      icon: Calendar,
      label: "Calendar",
      adminOnly: false,
    },
    {
      href: "/blockouts",
      icon: CalendarX,
      label: "My Blockouts",
      adminOnly: false,
    },
    {
      href: "/songs",
      icon: Music,
      label: "Song Library",
      adminOnly: true,
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-gray-800 shadow-lg"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => {
            setIsOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo and Brand */}
          <div className="flex items-center mb-8 p-4 mt-12 lg:mt-0">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-3">
              <Church className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              ChurchFlow
            </h1>
          </div>

          {/* Navigation Menu */}
          <ul className="space-y-2 font-medium">
            {navItems.map((item) => {
              // Skip admin-only items for non-admin users
              if (item.adminOnly && user?.role !== "admin") {
                return null;
              }

              const isActive = currentPath === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <div
                      className={`flex items-center p-2 rounded-lg group transition-all duration-200 cursor-pointer relative ${
                        isActive
                          ? "text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 font-semibold shadow-sm border-l-4 border-primary-600 dark:border-primary-400 pl-3"
                          : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-transparent"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isActive
                            ? "text-primary-600 dark:text-primary-400"
                            : ""
                        }`}
                      />
                      <span className="ml-3">{item.label}</span>
                      {item.adminOnly && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* User Profile Section */}
          <div className="absolute bottom-4 left-3 right-3">
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.firstName?.[0] || user?.email?.[0] || "U"}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName || user?.email || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role || "Member"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    console.log("go to user settings");
                    // (window.location.href = "/api/logout")
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
