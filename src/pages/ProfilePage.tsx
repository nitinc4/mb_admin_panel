import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, PlusCircle, Save } from 'lucide-react';
import { API_URL } from '../config';

export default function ProfilePage() {
  const { adminUser, login } = useApp();

  const [updateName, setUpdateName] = useState(adminUser?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [updatePassword, setUpdatePassword] = useState('');
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });

  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg({ type: '', text: '' });

    // Frontend validation: require current password if changing to a new one
    if (updatePassword && !currentPassword) {
      setUpdateMsg({ type: 'error', text: 'Please enter your current password to set a new one.' });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/update/${adminUser.id}`, {
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
        setUpdateMsg({ type: 'success', text: 'Profile updated successfully!' });
        setCurrentPassword('');
        setUpdatePassword('');
        login(true, data.user); 
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
        body: JSON.stringify({
          name: newName,
          email: newUsername,
          password: newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setCreateMsg({ type: 'success', text: 'New admin created successfully!' });
        setNewName('');
        setNewUsername('');
        setNewPassword('');
      } else {
        setCreateMsg({ type: 'error', text: data.error || 'Creation failed' });
      }
    } catch (err) {
      setCreateMsg({ type: 'error', text: 'Server error' });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Admin Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Update Existing */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-blue-600 w-6 h-6" />
            <h2 className="text-xl font-semibold">Update My Profile</h2>
          </div>

          {updateMsg.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${updateMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {updateMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required if changing password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={updatePassword}
                onChange={(e) => setUpdatePassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </div>

            <button type="submit" className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors mt-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </form>
        </div>

        {/* Create New Admin */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <PlusCircle className="text-green-600 w-6 h-6" />
            <h2 className="text-xl font-semibold">Create New Admin User</h2>
          </div>

          {createMsg.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${createMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {createMsg.text}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Manager Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="new_admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="flex items-center justify-center gap-2 w-full bg-green-600 text-white p-2.5 rounded-lg hover:bg-green-700 transition-colors mt-2">
              <PlusCircle className="w-4 h-4" /> Create User
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}