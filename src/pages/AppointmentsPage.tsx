import { useEffect, useState } from 'react';
import { Plus, X, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext'; 
import { API_URL } from '../config';

interface User { id: string; email: string; name: string; phone?: string; }
interface Appointment { 
  id: string; 
  _id?: string;
  user: User; 
  title?: string; 
  cost?: number; 
  scheduledAt?: string; 
  status: string; 
  notes?: string; 
  
  date?: string;
  timeSlot?: string;
  txnId?: string;
}

const getLocalToday = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function AppointmentsPage() {
  const { setActiveTab } = useApp(); 
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [price, setPrice] = useState('500');
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  const [form, setForm] = useState({ user_id: '', title: '', cost: 0, scheduled_at: getLocalToday(), scheduled_time: '10:00', notes: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptsRes, usrRes, configRes] = await Promise.all([
        fetch(`${API_URL}/api/appointments`), 
        fetch(`${API_URL}/api/users`),
        fetch(`${API_URL}/api/appointments/config`)
      ]);
      
      const appts = await apptsRes.json(); 
      const usr = await usrRes.json();
      const config = await configRes.json();

      if (appts.success) setAppointments(appts.data); 
      if (usr.success) setUsers(usr.data);
      if (config.success && config.data) setPrice(config.data.price.toString());

    } catch (error) { 
      console.error('Error:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdatePrice = async () => {
    setIsSavingPrice(true);
    try {
      await fetch(`${API_URL}/api/appointments/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price })
      });
      alert('Standard price updated successfully!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingPrice(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!form.user_id || !form.title) return alert('User and Title are required');
    try {
      const scheduled_at = new Date(`${form.scheduled_at}T${form.scheduled_time}`).toISOString();
      const response = await fetch(`${API_URL}/api/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, scheduled_at }) });
      const result = await response.json();
      
      if (result.success) {
        setAppointments([result.data, ...appointments]);
        setShowModal(false);
        setForm({ user_id: '', title: '', cost: 0, scheduled_at: getLocalToday(), scheduled_time: '10:00', notes: '' });
        
        // Fix for 500 error: Make sure we send 'user' alongside 'user_id' for schema match
        if (result.data.cost > 0) {
          await fetch(`${API_URL}/api/payments`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: form.user_id, // Sent explicit user object ID reference
              user_id: form.user_id, 
              amount: result.data.cost, 
              reason: `Appointment - ${result.data.title}`, 
              dueDate: scheduled_at, 
              status: 'upcoming', 
              appointment_id: result.data.id
            })
          });
        }
      }
    } catch (error) { console.error(error); }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      const result = await response.json();
      if (result.success) setAppointments(appointments.map(a => (a.id || a._id) === appointmentId ? result.data : a));
    } catch (error) { console.error(error); }
  };

  const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

  if (loading) return <div className="p-8 text-gray-500 bg-cream min-h-full">Loading appointments...</div>;

  return (
    <div className="p-8 bg-cream min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage incoming appointment requests</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-sm">
          <Plus size={18} /> New Appointment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 max-w-xl">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-orange-500" /> Standard App Appointment Price
        </h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
            <input 
              type="number" 
              value={price} 
              onChange={e => setPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <button 
            onClick={handleUpdatePrice} disabled={isSavingPrice}
            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
          >
            {isSavingPrice ? 'Saving...' : 'Update'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">This is the amount users will be charged in the mobile app.</p>
      </div>

      <div className="space-y-8 pb-10">
        {statuses.map(status => {
          const colAppointments = appointments.filter(a => a.status === status);
          if (colAppointments.length === 0) return null;

          return (
            <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                 <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">{status.replace('_', ' ')}</h3>
                 <span className="bg-orange-100 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">{colAppointments.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                   <thead className="bg-white border-b border-gray-100">
                      <tr>
                         <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Date / Time</th>
                         <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Username</th>
                         <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Email</th>
                         <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Phone Number</th>
                         <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-center">From Mantrika Brahma App</th>
                         <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Set Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {colAppointments.map(app => {
                        const safeId = app.id || app._id || Math.random().toString();
                        
                        // Parse date safely
                        let displayDate = 'N/A';
                        if (app.scheduledAt) displayDate = new Date(app.scheduledAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
                        else if (app.date && app.timeSlot) displayDate = `${new Date(app.date).toLocaleDateString('en-IN')} at ${app.timeSlot}`;

                        const isAppBooking = !!app.txnId || !!app.timeSlot;

                        return (
                          <tr key={safeId} className="hover:bg-orange-50/20 transition-colors">
                             <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">{displayDate}</td>
                             <td className="px-6 py-4 font-bold text-gray-900">{app.user?.name || 'N/A'}</td>
                             <td className="px-6 py-4 text-gray-500">{app.user?.email || 'N/A'}</td>
                             <td className="px-6 py-4 text-gray-500">{app.user?.phone || 'N/A'}</td>
                             <td className="px-6 py-4 text-center">
                                {isAppBooking ? (
                                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Yes</span>
                                ) : (
                                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">No</span>
                                )}
                             </td>
                             <td className="px-6 py-4 text-right">
                                <select 
                                   value={app.status}
                                   onChange={(e) => handleStatusChange(safeId, e.target.value)}
                                   className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary font-medium text-gray-700 outline-none cursor-pointer"
                                >
                                   {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
                                </select>
                             </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">New Appointment</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-800 transition-colors"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">User *</label>
                <select value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all">
                  <option value="">Select User</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Appointment Title *</label>
                <input type="text" placeholder="e.g. Health Consultation" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Appointment Cost (₹) *</label>
                <input type="number" placeholder="0 if free" value={form.cost} onChange={e => setForm({...form, cost: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                  <input type="date" value={form.scheduled_at} onChange={e => setForm({...form, scheduled_at: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time *</label>
                  <input type="time" value={form.scheduled_time} onChange={e => setForm({...form, scheduled_time: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" rows={3} placeholder="Add any details or instructions here..." />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-300 font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleCreateAppointment} className="flex-1 px-4 py-3 bg-primary font-semibold text-white rounded-xl hover:opacity-90 transition-opacity">Save Appointment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}