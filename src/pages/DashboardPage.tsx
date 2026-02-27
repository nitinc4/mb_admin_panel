import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, IndianRupee, TrendingUp } from 'lucide-react';

// Mock data for different time filters
const mockRevenueData = {
  'This Month': [
    { name: 'Appointments', value: 15000 },
    { name: 'Tiers/Groups', value: 45000 },
    { name: 'Batches/Courses', value: 25000 },
  ],
  'This Year': [
    { name: 'Appointments', value: 180000 },
    { name: 'Tiers/Groups', value: 540000 },
    { name: 'Batches/Courses', value: 320000 },
  ],
  'All Time': [
    { name: 'Appointments', value: 450000 },
    { name: 'Tiers/Groups', value: 1200000 },
    { name: 'Batches/Courses', value: 850000 },
  ],
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']; // Blue, Green, Yellow

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState<'This Month' | 'This Year' | 'All Time'>('This Month');

  const currentData = mockRevenueData[timeFilter];
  const totalRevenue = currentData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your app's performance and revenue.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-800">1,248</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Active Batches</p>
            <h3 className="text-2xl font-bold text-gray-800">12</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue ({timeFilter})</p>
            <h3 className="text-2xl font-bold text-gray-800">₹{totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
            <IndianRupee size={24} />
          </div>
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-gray-500" size={20} />
            <h2 className="text-lg font-bold text-gray-800">Revenue Breakdown</h2>
          </div>
          
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="mt-4 sm:mt-0 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={140}
                paddingAngle={5}
                dataKey="value"
              >
                {currentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}