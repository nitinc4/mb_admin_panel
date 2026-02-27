import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import UserModal from '../components/UserModal';
import TierModal from '../components/TierModal';

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
      const [usersRes, tiersRes] = await Promise.all([fetch('http://localhost:3001/api/users'), fetch('http://localhost:3001/api/tiers')]);
      const usersData = await usersRes.json();
      const tiersData = await tiersRes.json();
      if (usersData.success) setUsers(usersData.data);
      if (tiersData.success) setTiers(tiersData.data);
    } catch (error) { console.error('Error fetching data:', error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    if (!window.confirm(`Are you sure you want to ${isBlocked ? 'block' : 'unblock'} this user?`)) return;
    try {
      await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked }),
      });
      fetchData();
    } catch (error) { console.error('Error updating block status:', error); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete user?')) return;
    await fetch(`http://localhost:3001/api/users/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeleteTier = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tier?')) return;
    await fetch(`http://localhost:3001/api/tiers/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const filteredUsers = users.filter((u) => !u.isBlocked && ((u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.phone || '').includes(searchQuery)));
  const blockedUsers = users.filter((u) => u.isBlocked && ((u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.phone || '').includes(searchQuery)));
  const filteredTiers = tiers.filter((tier) => tier.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8">
      <div className="mb-6"><h1 className="text-3xl font-bold text-gray-800">User Management</h1></div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex gap-4">
              <button onClick={() => setActiveView('users')} className={`px-4 py-2 rounded-lg font-medium ${activeView === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>Active Users</button>
              <button onClick={() => setActiveView('blocked')} className={`px-4 py-2 rounded-lg font-medium ${activeView === 'blocked' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}>Blocked</button>
              <button onClick={() => setActiveView('tiers')} className={`px-4 py-2 rounded-lg font-medium ${activeView === 'tiers' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>Tiers</button>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search name/phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              {activeView !== 'blocked' && <button onClick={() => { activeView === 'users' ? setSelectedUser(null) : setSelectedTier(null); activeView === 'users' ? setIsUserModalOpen(true) : setIsTierModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus className="w-4 h-4" /> Add</button>}
            </div>
          </div>
        </div>

        {isLoading ? <div className="p-8 text-center text-gray-500">Loading...</div> : activeView === 'tiers' ? (
           <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b"><tr><th className="p-4">Name</th><th className="p-4">Description</th><th className="p-4">Prices</th><th className="p-4 text-right">Actions</th></tr></thead>
              <tbody>{filteredTiers.map(t => <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{t.name}</td>
                <td className="p-4 text-sm text-gray-600">{t.description}</td>
                <td className="p-4 text-sm text-gray-700">
                  {t.monthlyPrice > 0 && <div>₹{t.monthlyPrice} <span className="text-gray-400 text-xs">/mo</span></div>}
                  {t.yearlyPrice > 0 && <div>₹{t.yearlyPrice} <span className="text-gray-400 text-xs">/yr</span></div>}
                  {t.lifetimePrice > 0 && <div>₹{t.lifetimePrice} <span className="text-gray-400 text-xs">/lifetime</span></div>}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => { setSelectedTier(t); setIsTierModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                  <button onClick={() => handleDeleteTier(t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                </td>
              </tr>)}</tbody>
            </table>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr><th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th><th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th><th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tier</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(activeView === 'users' ? filteredUsers : blockedUsers).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><div className="font-medium text-gray-900">{user.name}</div><div className="text-xs text-gray-500">{user.email}</div></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.phone || '-'}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{user.tier ? user.tier.name : 'No Tier'}</span></td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                      {user.isBlocked ? (
                        <button onClick={() => handleToggleBlock(user.id, false)} className="flex items-center gap-1 p-2 text-green-600 hover:bg-green-50 rounded text-xs font-bold"><ShieldCheck size={16}/> Unblock</button>
                      ) : (
                        <button onClick={() => handleToggleBlock(user.id, true)} className="flex items-center gap-1 p-2 text-yellow-600 hover:bg-yellow-50 rounded text-xs font-bold"><ShieldAlert size={16}/> Block</button>
                      )}
                      <button onClick={() => { setSelectedUser(user); setIsUserModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                      <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
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