import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import UserModal from '../components/UserModal';
import TierModal from '../components/TierModal';

interface Tier {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  tier: Tier | null; // Populated by Mongoose
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [activeView, setActiveView] = useState<'users' | 'tiers'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [users, setUsers] = useState<User[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  // FETCH DATA FUNCTION
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, tiersRes] = await Promise.all([
        fetch('http://localhost:3001/api/users'),
        fetch('http://localhost:3001/api/tiers')
      ]);
      
      const usersData = await usersRes.json();
      const tiersData = await tiersRes.json();
      
      if (usersData.success) setUsers(usersData.data);
      if (tiersData.success) setTiers(tiersData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // DELETE FUNCTIONS
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`http://localhost:3001/api/users/${id}`, { method: 'DELETE' });
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeleteTier = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tier?')) return;
    try {
      await fetch(`http://localhost:3001/api/tiers/${id}`, { method: 'DELETE' });
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error deleting tier:', error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTiers = tiers.filter((tier) =>
    tier.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNew = () => {
    if (activeView === 'users') {
      setSelectedUser(null);
      setIsUserModalOpen(true);
    } else {
      setSelectedTier(null);
      setIsTierModalOpen(true);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User & Tier Management</h1>
        <p className="text-gray-600 mt-1">Manage users and their tier assignments</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveView('users')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveView('tiers')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'tiers' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Tiers
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add {activeView === 'users' ? 'User' : 'Tier'}
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading data from database...</div>
        ) : activeView === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={7} className="p-4 text-center text-gray-500">No users found.</td></tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{user.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.tier ? user.tier.name : 'No Tier'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedUser(user); setIsUserModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                 {filteredTiers.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">No tiers found.</td></tr>
                ) : filteredTiers.map((tier) => {
                  const userCount = users.filter(u => u.tier?.id === tier.id).length;
                  return (
                  <tr key={tier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{tier.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600">{tier.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-semibold">₹{tier.price.toFixed(2)}/mo</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {userCount} users
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedTier(tier); setIsTierModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteTier(tier.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isUserModalOpen && (
        <UserModal
          user={selectedUser}
          tiers={tiers} // Pass the fetched tiers!
          onClose={() => {
            setIsUserModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            setIsUserModalOpen(false);
            setSelectedUser(null);
            fetchData(); // Refresh table
          }}
        />
      )}

      {isTierModalOpen && (
        <TierModal
          tier={selectedTier}
          onClose={() => {
            setIsTierModalOpen(false);
            setSelectedTier(null);
          }}
          onSave={() => {
            setIsTierModalOpen(false);
            setSelectedTier(null);
            fetchData(); // Refresh table
          }}
        />
      )}
    </div>
  );
}