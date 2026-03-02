import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import UserModal from '../components/UserModal';
import TierModal from '../components/TierModal';
import { API_URL } from '../config';

interface Tier { id: string; name: string; description: string; monthlyPrice: number; yearlyPrice: number; lifetimePrice: number; }
interface User { id: string; email: string; name: string; phone: string; tier: Tier | null; isActive: boolean; isBlocked: boolean; createdAt: string; }

export default function UsersPage() {
  const [activeView, setActiveView] = useState<'users' | 'tiers' | 'blocked'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, tiersRes] = await Promise.all([
        fetch(`${API_URL}/api/users`),
        fetch(`${API_URL}/api/tiers`)
      ]);
      const usersData = await usersRes.json();
      const tiersData = await tiersRes.json();
      if (usersData.success) setUsers(usersData.data);
      if (tiersData.success) setTiers(tiersData.data);
    } catch (error) { console.error('Error fetching data:', error); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    if (!window.confirm(`Are you sure you want to ${isBlocked ? 'block' : 'unblock'} this user?`)) return;
    try {
      await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked }),
      });
      fetchData();
    } catch (error) { console.error('Error updating block status:', error); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete user?')) return;
    await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeleteTier = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tier?')) return;
    await fetch(`${API_URL}/api/tiers/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const filteredUsers = users.filter((u) => !u.isBlocked && ((u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.phone || '').includes(searchQuery)));
  const blockedUsers = users.filter((u) => u.isBlocked && ((u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.phone || '').includes(searchQuery)));
  const filteredTiers = tiers.filter((tier) => tier.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 bg-cream min-h-full">
      <div className="mb-6"><h1 className="text-3xl font-bold text-gray-800">User Management</h1></div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveView('users')} 
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeView === 'users' ? 'bg-orange-50 text-primary' : 'text-gray-600 hover:bg-orange-50/50 hover:text-primary'}`}
              >
                Active Users
              </button>
              <button 
                onClick={() => setActiveView('blocked')} 
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeView === 'blocked' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-red-50/50 hover:text-red-500'}`}
              >
                Blocked
              </button>
              <button 
                onClick={() => setActiveView('tiers')} 
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeView === 'tiers' ? 'bg-orange-50 text-primary' : 'text-gray-600 hover:bg-orange-50/50 hover:text-primary'}`}
              >
                Tiers
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search name/phone..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                />
              </div>
              {activeView !== 'blocked' && (
                <button 
                  onClick={() => { activeView === 'users' ? setSelectedUser(null) : setSelectedTier(null); activeView === 'users' ? setIsUserModalOpen(true) : setIsTierModalOpen(true); }} 
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-sm shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? <div className="p-8 text-center text-gray-500 font-medium">Loading...</div> : activeView === 'tiers' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr><th className="p-4 font-bold text-gray-500 uppercase text-xs">Name</th><th className="p-4 font-bold text-gray-500 uppercase text-xs">Description</th><th className="p-4 font-bold text-gray-500 uppercase text-xs">Prices</th><th className="p-4 text-right font-bold text-gray-500 uppercase text-xs">Actions</th></tr>
              </thead>
              <tbody>{filteredTiers.map(t => <tr key={t.id} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors">
                <td className="p-4 font-bold text-gray-800">{t.name}</td>
                <td className="p-4 text-sm text-gray-500 font-medium">{t.description}</td>
                <td className="p-4 text-sm text-gray-700 font-bold">
                  {t.monthlyPrice > 0 && <div>₹{t.monthlyPrice} <span className="text-gray-400 font-medium text-xs">/mo</span></div>}
                  {t.yearlyPrice > 0 && <div>₹{t.yearlyPrice} <span className="text-gray-400 font-medium text-xs">/yr</span></div>}
                  {t.lifetimePrice > 0 && <div>₹{t.lifetimePrice} <span className="text-gray-400 font-medium text-xs">/lifetime</span></div>}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => { setSelectedTier(t); setIsTierModalOpen(true); }} className="p-2 text-primary hover:bg-orange-100 rounded-lg transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDeleteTier(t.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>)}</tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr><th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th><th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th><th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tier</th><th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(activeView === 'users' ? filteredUsers : blockedUsers).map((user) => (
                  <tr key={user.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4"><div className="font-bold text-gray-900">{user.name}</div><div className="text-xs text-gray-500 font-medium">{user.email}</div></td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{user.phone || '-'}</td>
                    <td className="px-6 py-4"><span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-100 text-primary">{user.tier ? user.tier.name : 'No Tier'}</span></td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                      {user.isBlocked ? (
                        <button onClick={() => handleToggleBlock(user.id, false)} className="flex items-center gap-1 p-2 text-green-600 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"><ShieldCheck size={16} /> Unblock</button>
                      ) : (
                        <button onClick={() => handleToggleBlock(user.id, true)} className="flex items-center gap-1 p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg text-xs font-bold transition-colors"><ShieldAlert size={16} /> Block</button>
                      )}
                      <button onClick={() => { setSelectedUser(user); setIsUserModalOpen(true); }} className="p-2 text-primary hover:bg-orange-100 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isUserModalOpen && <UserModal user={selectedUser} tiers={tiers} onClose={() => { setIsUserModalOpen(false); setSelectedUser(null); }} onSave={() => { setIsUserModalOpen(false); setSelectedUser(null); fetchData(); }} />}
      {isTierModalOpen && <TierModal tier={selectedTier} onClose={() => { setIsTierModalOpen(false); setSelectedTier(null); }} onSave={() => { setIsTierModalOpen(false); setSelectedTier(null); fetchData(); }} />}
    </div>
  );
}