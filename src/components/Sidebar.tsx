import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Video,
  Calendar,
  DollarSign,
  Settings,
  Bell,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users & Tiers', icon: Users },
  { id: 'batches', label: 'Batches & Content', icon: FolderOpen },
  { id: 'live-classes', label: 'Live Classes', icon: Video },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'billing', label: 'Billing', icon: DollarSign },
  { id: 'messages', label: 'Messages', icon: MessageSquare }, 
  { id: 'notifications', label: 'Notifications', icon: Bell },
  // CHANGED FROM 'settings' TO 'services'
  { id: 'services', label: 'Services', icon: Settings }, 
];

export default function Sidebar() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">MantrikaBrahma</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}