import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Video,
  Calendar,
  DollarSign,
  Settings,
  Bell,
  MessageSquare,
  UserCheck
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
  { id: 'attendance', label: 'Attendance', icon: UserCheck },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'billing', label: 'Billing', icon: DollarSign },
  { id: 'messages', label: 'Messages', icon: MessageSquare }, 
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'services', label: 'Services', icon: Settings }, 
];

export default function Sidebar() {
  const { activeTab, setActiveTab, adminUser, logout } = useApp();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
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
        <div 
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-semibold uppercase">
              {adminUser?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-gray-800 truncate">{adminUser?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500 truncate">{adminUser?.email || 'admin@example.com'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-2 w-full text-left text-sm text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}