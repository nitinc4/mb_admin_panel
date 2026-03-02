import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, IndianRupee, TrendingUp } from 'lucide-react';
import { API_URL } from '../config';
import { useApp } from '../context/AppContext'; // <-- IMPORTED CONTEXT

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']; // Blue, Green, Yellow

interface User { id: string; }
interface Batch { id: string; isActive: boolean; }
interface Payment {
  dueDate: string;
  id: string;
  amount: number;
  reason: string;
  status: string;
  paymentDate: string; // Used to filter by 'This Month' or 'This Year'
}

export default function DashboardPage() {
  const { setActiveTab } = useApp(); // <-- EXTRACTED SET ACTIVE TAB

  const [timeFilter, setTimeFilter] = useState<'This Month' | 'This Year' | 'All Time'>('This Month');
  
  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [usersRes, batchesRes, paymentsRes] = await Promise.all([
          fetch(`${API_URL}/api/users`),
          fetch(`${API_URL}/api/batches`),
          fetch(`${API_URL}/api/payments`),
        ]);

        const usersData = await usersRes.json();
        const batchesData = await batchesRes.json();
        const paymentsData = await paymentsRes.json();

        if (usersData.success) setUsers(usersData.data);
        if (batchesData.success) setBatches(batchesData.data);
        if (paymentsData.success) setPayments(paymentsData.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0); 

    if (timeFilter === 'This Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeFilter === 'This Year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    let appointmentsRevenue = 0;
    let tiersRevenue = 0;
    let otherRevenue = 0;

    payments.forEach((payment) => {
      if (payment.status === 'paid') {
        const dateString = payment.paymentDate || payment.dueDate;
        const pDate = dateString ? new Date(dateString) : new Date();
        
        if (pDate >= startDate) {
          const reason = (payment.reason || '').toLowerCase();
          
          if (reason.includes('appointment')) {
            appointmentsRevenue += payment.amount;
          } else if (reason.includes('tier') || reason.includes('subscription')) {
            tiersRevenue += payment.amount;
          } else {
            otherRevenue += payment.amount; 
          }
        }
      }
    });

    return [
      { name: 'Appointments', value: appointmentsRevenue },
      { name: 'Tiers/Subscriptions', value: tiersRevenue },
      { name: 'Other/Batches', value: otherRevenue },
    ];
  }, [payments, timeFilter]);

  const totalRevenue = chartData.reduce((sum, item) => sum + item.value, 0);
  const activeBatchesCount = batches.filter(b => b.isActive).length;

  if (loading) {
    return <div className="p-8 text-gray-500">Loading dashboard data...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your app's performance and revenue.</p>
      </div>

      {/* Top Stat Cards - ADDED ONCLICK AND HOVER EFFECTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => setActiveTab('users')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-blue-600 transition-colors">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-800">{users.length}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('batches')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-green-600 transition-colors">Active Batches</p>
            <h3 className="text-2xl font-bold text-gray-800">{activeBatchesCount}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('billing')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-yellow-600 transition-colors">Revenue ({timeFilter})</p>
            <h3 className="text-2xl font-bold text-gray-800">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
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
          {totalRevenue === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              No revenue collected for this period yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.filter(d => d.value > 0)} 
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₹${(value ?? 0).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}