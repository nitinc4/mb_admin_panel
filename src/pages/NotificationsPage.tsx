import { useState, useEffect } from 'react';
import { Bell, Plus, Calendar, Image as ImageIcon, Trash2, CheckCircle, Clock, Users, BookOpen } from 'lucide-react';
import { API_URL } from '../config';

interface Tier { id: string; name: string; }
interface Batch { id: string; name: string; }
interface Notification {
  _id: string; // Mongoose ID
  title: string;
  body: string;
  imageUrl: string;
  targetType: string;
  targetId: string;
  scheduledAt: string;
  isRepeating: boolean;
  repeatInterval: string;
  status: string;
  type: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'create'>('history');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({
    title: '',
    body: '',
    imageUrl: '',
    targetType: 'all', // 'all', 'tier', 'batch'
    targetId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    isRepeating: false,
    repeatInterval: 'none' // 'daily', 'weekly', 'monthly'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notifRes, tiersRes, batchesRes] = await Promise.all([
        fetch(`${API_URL}/api/notifications`),
        fetch(`${API_URL}/api/tiers`),
        fetch(`${API_URL}/api/batches`)
      ]);

      const notifData = await notifRes.json();
      const tiersData = await tiersRes.json();
      const batchesData = await batchesRes.json();

      if (notifData.success) setNotifications(notifData.data);
      if (tiersData.success) setTiers(tiersData.data);
      if (batchesData.success) setBatches(batchesData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scheduledAt = new Date(`${form.scheduledDate}T${form.scheduledTime}`).toISOString();
      
      const payload = {
        title: form.title,
        body: form.body,
        imageUrl: form.imageUrl,
        targetType: form.targetType,
        targetId: form.targetId || null,
        scheduledAt,
        isRepeating: form.isRepeating,
        repeatInterval: form.isRepeating ? form.repeatInterval : 'none',
        type: 'promotional' // default for manually created ones
      };

      const res = await fetch('${API_URL}/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        alert('Notification Scheduled!');
        setForm({
          title: '', body: '', imageUrl: '', targetType: 'all', targetId: '',
          scheduledDate: new Date().toISOString().split('T')[0], scheduledTime: '10:00',
          isRepeating: false, repeatInterval: 'none'
        });
        setActiveTab('history');
        fetchData();
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this notification? If it's pending, it won't be sent.")) return;
    try {
      await fetch(`${API_URL}/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading Notifications...</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Push Notifications</h1>
        <p className="text-gray-600 mt-1">Schedule and manage alerts sent directly to user devices.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button onClick={() => setActiveTab('history')} className={`px-6 py-4 font-medium transition-colors ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            Notification History
          </button>
          <button onClick={() => setActiveTab('create')} className={`px-6 py-4 font-medium transition-colors flex items-center gap-2 ${activeTab === 'create' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Plus size={18}/> New Notification
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateNotification} className="max-w-3xl space-y-6">
              
              {/* Message Content */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Bell size={18}/> Message Content</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g., Flash Sale! 50% Off" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message Body *</label>
                  <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Type your message here..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="text-gray-400" size={20}/>
                    <input type="url" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://example.com/image.jpg" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Paste a direct link to an image to show a rich banner notification.</p>
                </div>
              </div>

              {/* Target Audience */}
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 space-y-4">
                <h3 className="font-bold text-blue-900 flex items-center gap-2"><Users size={18}/> Target Audience</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Send To</label>
                    <select value={form.targetType} onChange={e => setForm({...form, targetType: e.target.value, targetId: ''})} className="w-full px-3 py-2 border rounded-lg">
                      <option value="all">All Active Users</option>
                      <option value="tier">Specific Tier</option>
                      <option value="batch">Specific Batch</option>
                    </select>
                  </div>
                  
                  {form.targetType === 'tier' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Select Tier</label>
                      <select value={form.targetId} onChange={e => setForm({...form, targetId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                        <option value="">Choose...</option>
                        {tiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  )}

                  {form.targetType === 'batch' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Select Batch</label>
                      <select value={form.targetId} onChange={e => setForm({...form, targetId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                        <option value="">Choose...</option>
                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Scheduling & Repeating */}
              <div className="bg-purple-50 p-5 rounded-lg border border-purple-100 space-y-4">
                <h3 className="font-bold text-purple-900 flex items-center gap-2"><Calendar size={18}/> Scheduling</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Date *</label><input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
                  <div><label className="block text-sm font-medium mb-1">Time *</label><input type="time" value={form.scheduledTime} onChange={e => setForm({...form, scheduledTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
                </div>
                
                <div className="flex items-center pt-2">
                  <input type="checkbox" id="isRepeating" checked={form.isRepeating} onChange={e => setForm({...form, isRepeating: e.target.checked})} className="w-4 h-4 text-purple-600 rounded" />
                  <label htmlFor="isRepeating" className="ml-2 font-medium text-purple-900">Repeat this notification automatically</label>
                </div>
                
                {form.isRepeating && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-purple-900">Repeat Interval</label>
                    <select value={form.repeatInterval} onChange={e => setForm({...form, repeatInterval: e.target.value})} className="w-full max-w-xs px-3 py-2 border rounded-lg">
                      <option value="daily">Every Day</option>
                      <option value="weekly">Every Week</option>
                      <option value="monthly">Every Month</option>
                    </select>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md">
                Schedule Notification
              </button>
            </form>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-xs font-medium text-gray-500 uppercase">Message</th>
                    <th className="p-4 text-xs font-medium text-gray-500 uppercase">Type / Target</th>
                    <th className="p-4 text-xs font-medium text-gray-500 uppercase">Scheduled For</th>
                    <th className="p-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="p-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notifications.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No notifications scheduled.</td></tr>
                  ) : notifications.map(notif => (
                    <tr key={notif._id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{notif.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-1">{notif.body}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold uppercase text-gray-500 bg-gray-100 px-2 py-1 rounded">{notif.type.replace('_', ' ')}</span>
                        <div className="text-xs text-gray-600 mt-1 capitalize flex items-center gap-1">
                          {notif.targetType === 'all' ? <Users size={12}/> : <BookOpen size={12}/>} 
                          Target: {notif.targetType}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-800">
                        {new Date(notif.scheduledAt).toLocaleString()}
                        {notif.isRepeating && <span className="block text-xs text-purple-600 mt-1 font-semibold">Repeats {notif.repeatInterval}</span>}
                      </td>
                      <td className="p-4">
                        {notif.status === 'sent' ? (
                          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold w-max"><CheckCircle size={14}/> Sent</span>
                        ) : notif.status === 'pending' ? (
                          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-bold w-max"><Clock size={14}/> Pending</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold w-max">Failed</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(notif._id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}