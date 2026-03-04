import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, PlusCircle, Save, Trash2, Edit } from 'lucide-react';
import { API_URL } from '../config';

export default function ProfilePage() {
  const { adminUser, login } = useApp();

  const [admins, setAdmins] = useState<any[]>([]);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  // Update Profile State
  const [editingUserId, setEditingUserId] = useState(adminUser?.id || adminUser?._id);
  const [updateName, setUpdateName] = useState(adminUser?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [updatePassword, setUpdatePassword] = useState('');
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });

  // Create Profile State
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/admins`);
      const data = await res.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admins');
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleEditClick = (admin: any) => {
    setEditingUserId(admin.id || admin._id);
    setUpdateName(admin.name);
    setCurrentPassword('');
    setUpdatePassword('');
    setShowUpdateProfile(true);
    setUpdateMsg({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAdmin = async (id: string) => {
    if (id === adminUser.id || id === adminUser._id) {
      alert("You cannot delete yourself.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this admin account?")) return;
    
    try {
      await fetch(`${API_URL}/api/auth/delete/${id}`, { method: 'DELETE' });
      fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg({ type: '', text: '' });

    if (updatePassword && !currentPassword) {
      setUpdateMsg({ type: 'error', text: 'Please enter current password to set a new one.' });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/update/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updateName,
          currentPassword: currentPassword || undefined,
          password: updatePassword || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setUpdateMsg({ type: 'success', text: 'Admin updated successfully!' });
        setCurrentPassword('');
        setUpdatePassword('');
        // Update local session context if editing self
        if (editingUserId === adminUser.id || editingUserId === adminUser._id) {
          login(true, data.user); 
        }
        fetchAdmins();
        setTimeout(() => setShowUpdateProfile(false), 2000);
      } else {
        setUpdateMsg({ type: 'error', text: data.error || 'Update failed' });
      }
    } catch (err) {
      setUpdateMsg({ type: 'error', text: 'Server error' });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API_URL}/api/auth/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newUsername, password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setCreateMsg({ type: 'success', text: 'New admin created successfully!' });
        setNewName(''); setNewUsername(''); setNewPassword('');
        fetchAdmins();
        setTimeout(() => setShowCreateAdmin(false), 2000);
      } else {
        setCreateMsg({ type: 'error', text: data.error || 'Creation failed' });
      }
    } catch (err) {
      setCreateMsg({ type: 'error', text: 'Server error' });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
        <div className="flex gap-4">
           <button 
             onClick={() => {
                setEditingUserId(adminUser.id || adminUser._id);
                setUpdateName(adminUser.name);
                setShowUpdateProfile(!showUpdateProfile);
             }}
             className="px-4 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
           >
             {showUpdateProfile ? 'Cancel Edit' : 'Edit My Profile'}
           </button>
           <button 
             onClick={() => setShowCreateAdmin(!showCreateAdmin)}
             className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
           >
             <PlusCircle size={18} /> Add Admin
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {showUpdateProfile && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 mb-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-blue-600 w-6 h-6" />
              <h2 className="text-xl font-semibold">Update Admin Profile</h2>
            </div>
            {updateMsg.text && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${updateMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {updateMsg.text}
              </div>
            )}
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input type="text" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={updateName} onChange={(e) => setUpdateName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password (Required for saving password)</label>
                <input type="password" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={updatePassword} onChange={(e) => setUpdatePassword(e.target.value)} placeholder="Leave blank to keep current" />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors mt-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </form>
          </div>
        )}

        {showCreateAdmin && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 mb-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <PlusCircle className="text-green-600 w-6 h-6" />
              <h2 className="text-xl font-semibold">Create New Admin User</h2>
            </div>
            {createMsg.text && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${createMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {createMsg.text}
              </div>
            )}
            <form onSubmit={handleCreateUser} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Manager Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username (Email)</label>
                <input type="text" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="new_admin" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 w-full bg-green-600 text-white p-2.5 rounded-lg hover:bg-green-700 transition-colors mt-2">
                <PlusCircle className="w-4 h-4" /> Create User
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
             <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                   <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Admin Name</th>
                   <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Username / Email</th>
                   <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {admins.map(admin => {
                  const id = admin.id || admin._id;
                  const isSelf = id === adminUser?.id || id === adminUser?._id;
                  
                  return (
                    <tr key={id} className="hover:bg-orange-50/20 transition-colors">
                       <td className="px-6 py-4 font-bold text-gray-900">
                         {admin.name} {isSelf && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">You</span>}
                       </td>
                       <td className="px-6 py-4 text-gray-500">{admin.email}</td>
                       <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleEditClick(admin)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Admin"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          {!isSelf && (
                            <button 
                              onClick={() => handleDeleteAdmin(id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Admin"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                       </td>
                    </tr>
                  );
                })}
             </tbody>
          </table>
        </div>

      </div>
    </div>
  );
} 