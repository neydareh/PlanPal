import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { 
  Church, 
  Calendar, 
  CalendarX, 
  Music, 
  Plus,
  Settings
} from "lucide-react";
import { Link } from "wouter";

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const { user } = useAuth();

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
    <aside className="fixed left-0 top-0 z-40 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="h-full px-3 py-4 overflow-y-auto">
        {/* Logo and Brand */}
        <div className="flex items-center mb-8 p-4">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-3">
            <Church className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">ChurchFlow</h1>
        </div>
        
        {/* Navigation Menu */}
        <ul className="space-y-2 font-medium">
          {navItems.map((item) => {
            // Skip admin-only items for non-admin users
            if (item.adminOnly && user?.role !== 'admin') {
              return null;
            }

            const isActive = currentPath === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <a className={`flex items-center p-2 rounded-lg group transition-colors ${
                    isActive 
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span className="ml-3">{item.label}</span>
                    {item.adminOnly && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Admin
                      </Badge>
                    )}
                  </a>
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
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName || user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role || 'Member'}
                </p>
              </div>
              <button 
                onClick={() => window.location.href = '/api/logout'}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
