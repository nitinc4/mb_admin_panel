import { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import UserModal from '../components/UserModal';
import TierModal from '../components/TierModal';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  tier_name: string;
  is_active: boolean;
  created_at: string;
}

interface Tier {
  id: string;
  name: string;
  description: string;
  price: number;
  user_count: number;
}

const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    full_name: 'John Doe',
    phone: '+1234567890',
    tier_name: 'Premium',
    is_active: true,
    created_at: '2024-01-15',
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    full_name: 'Jane Smith',
    phone: '+1234567891',
    tier_name: 'Basic',
    is_active: true,
    created_at: '2024-01-20',
  },
  {
    id: '3',
    email: 'bob.johnson@example.com',
    full_name: 'Bob Johnson',
    phone: '+1234567892',
    tier_name: 'Premium',
    is_active: false,
    created_at: '2024-02-01',
  },
];

const mockTiers: Tier[] = [
  {
    id: '1',
    name: 'Basic',
    description: 'Basic tier with limited access',
    price: 99.99,
    user_count: 45,
  },
  {
    id: '2',
    name: 'Premium',
    description: 'Premium tier with full access',
    price: 199.99,
    user_count: 128,
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'Enterprise tier with custom features',
    price: 499.99,
    user_count: 12,
  },
];

export default function UsersPage() {
  const [activeView, setActiveView] = useState<'users' | 'tiers'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTiers = mockTiers.filter((tier) =>
    tier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleEditTier = (tier: Tier) => {
    setSelectedTier(tier);
    setIsTierModalOpen(true);
  };

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
                  activeView === 'users'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveView('tiers')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'tiers'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
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

        {activeView === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{user.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.tier_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTiers.map((tier) => (
                  <tr key={tier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{tier.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600">{tier.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-semibold">
                        ${tier.price.toFixed(2)}/mo
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {tier.user_count} users
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditTier(tier)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isUserModalOpen && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setIsUserModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            setIsUserModalOpen(false);
            setSelectedUser(null);
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
          }}
        />
      )}
    </div>
  );
}
