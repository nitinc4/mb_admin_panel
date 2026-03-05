import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Video,
  Calendar,
  DollarSign,
  Settings,
  Bell,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_URL } from '../config';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasNotification?: boolean;
}

export default function Sidebar() {
  const { activeTab, setActiveTab, adminUser, logout } = useApp();
  const [hasNewAppointments, setHasNewAppointments] = useState(false);
  const [lastAppointmentCount, setLastAppointmentCount] = useState(0);

  // Polling to simulate instant refresh and trigger red dot notification
  useEffect(() => {
    const checkNewAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${API_URL}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        const currentCount = data.length || 0;
        
        // If we have previously fetched and the count went up, show dot
        if (lastAppointmentCount !== 0 && currentCount > lastAppointmentCount) {
          setHasNewAppointments(true);
        }
        setLastAppointmentCount(currentCount);
      } catch (error) {
        console.error("Failed to fetch appointments for notification check", error);
      }
    };

    // Initial check
    checkNewAppointments();

    // Poll every 15 seconds
    const interval = setInterval(checkNewAppointments, 15000);
    return () => clearInterval(interval);
  }, [lastAppointmentCount]);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users & Tiers', icon: Users },
    { id: 'batches', label: 'Batches & Content', icon: FolderOpen },
    { id: 'live-classes', label: 'Live Classes', icon: Video },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'appointments', label: 'Appointments', icon: Calendar, hasNotification: hasNewAppointments },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'services', label: 'Services', icon: Settings }, 
  ];

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
                  onClick={() => {
                    setActiveTab(item.id);
                    // Clear the notification dot when clicked
                    if (item.id === 'appointments') {
                      setHasNewAppointments(false);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.hasNotification && (
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  )}
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
            <p className="text-xs text-gray-500 truncate">{adminUser?.phone || adminUser?.email || 'Admin'}</p>
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