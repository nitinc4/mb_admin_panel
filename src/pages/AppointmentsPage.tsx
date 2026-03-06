import { useEffect, useState } from 'react';
import { Plus, X, DollarSign, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext'; 
import { API_URL } from '../config';

interface User { id?: string; _id?: string; email: string; name: string; phone?: string; }
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
  appointmentType?: string; 
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
  
  // Separate Pricing States
  const [standardPrice, setStandardPrice] = useState('500');
  const [vipPrice, setVipPrice] = useState('1000');
  
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [activeStatus, setActiveStatus] = useState('pending');

  const [form, setForm] = useState({ 
    user_id: '', title: '', date: getLocalToday(), timeSlot: '', notes: '' 
  });

  const fetchData = async () => {
    try {
      const [apptsRes, usrRes, configRes] = await Promise.all([
        fetch(`${API_URL}/api/appointments`), fetch(`${API_URL}/api/users`), fetch(`${API_URL}/api/appointments/config`)
      ]);
      const appts = await apptsRes.json(); const usr = await usrRes.json(); const config = await configRes.json();
      if (appts.success) setAppointments(appts.data); 
      if (usr.success) setUsers(usr.data);
      
      if (config.success && config.data) {
          setStandardPrice(config.data.standardPrice?.toString() || '500');
          setVipPrice(config.data.vipPrice?.toString() || '1000');
      }
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  useEffect(() => { 
      fetchData(); 
      
      // Auto-refresh appointments list every 10 seconds silently
      const interval = setInterval(() => {
          fetch(`${API_URL}/api/appointments`)
            .then(res => res.json())
            .then(data => {
               if (data.success) {
                   setAppointments(data.data);
               }
            })
            .catch(console.error);
      }, 10000);
      
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showModal && form.date) {
      setIsLoadingSlots(true);
      fetch(`${API_URL}/api/appointments/available-slots?date=${form.date}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setAvailableSlots(data.data);
            if (data.data.length > 0 && !data.data.includes(form.timeSlot)) setForm(f => ({ ...f, timeSlot: data.data[0] }));
            else if (data.data.length === 0) setForm(f => ({ ...f, timeSlot: '' }));
          }
        })
        .finally(() => setIsLoadingSlots(false));
    }
  }, [form.date, showModal]);

  const handleUpdatePrices = async () => {
    setIsSavingPrice(true);
    try {
      const response = await fetch(`${API_URL}/api/appointments/config`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
              standardPrice: Number(standardPrice), 
              vipPrice: Number(vipPrice) 
          }) 
      });
      const result = await response.json();
      if (result.success) alert('Appointment pricing updated successfully!');
      else alert('Failed to update pricing');
    } catch (e) { console.error(e); alert('Error updating price configuration'); } finally { setIsSavingPrice(false); }
  };

  const handleCreateAppointment = async () => {
    if (!form.user_id || !form.timeSlot) return alert('User and Time Slot are required.');
    try {
      const response = await fetch(`${API_URL}/api/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (result.success) {
        setAppointments([result.data, ...appointments]); setShowModal(false); setForm({ user_id: '', title: '', date: getLocalToday(), timeSlot: '', notes: '' });
      } else alert(result.message || 'Error booking slot');
    } catch (error) { console.error(error); }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      const result = await response.json();
      if (result.success) setAppointments(appointments.map(a => (a.id || a._id) === appointmentId ? result.data : a));
    } catch (error) { console.error(error); }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await fetch(`${API_URL}/api/appointments/${appointmentId}`, { method: 'DELETE' });
      setAppointments(appointments.filter(a => (a.id || a._id) !== appointmentId));
    } catch (error) { console.error(error); }
  };

  const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  const activeAppointments = appointments.filter(a => a.status === activeStatus);

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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 max-w-2xl">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-orange-500" /> App Appointment Pricing
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-1">Standard Price (₹)</label>
            <p className="text-xs text-gray-500 mb-1">Mon - Wed</p>
            <input 
              type="number" 
              value={standardPrice} 
              onChange={e => setStandardPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-1">VIP Price (₹)</label>
             <p className="text-xs text-gray-500 mb-1">Fri - Sat</p>
            <input 
              type="number" 
              value={vipPrice} 
              onChange={e => setVipPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <button 
            onClick={handleUpdatePrices} disabled={isSavingPrice}
            className="w-full sm:w-auto px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition-colors h-10"
          >
            {isSavingPrice ? 'Saving...' : 'Update Pricing'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-2">
        {statuses.map(s => {
          const count = appointments.filter(a => a.status === s).length;
          return (
            <button 
               key={s}
               onClick={() => setActiveStatus(s)}
               className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${activeStatus === s ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
               {s.replace('_', ' ')}
               <span className={`px-2 py-0.5 rounded-full text-xs ${activeStatus === s ? 'bg-orange-100 text-primary' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-10">
        <div className="overflow-x-auto">
          {activeAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No {activeStatus.replace('_', ' ')} appointments found.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
               <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                     <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Date / Time</th>
                     <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Username</th>
                     <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-center">Type</th>
                     <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Phone</th>
                     <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-center">From App</th>
                     <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {activeAppointments.map(app => {
                    const safeId = app.id || app._id || Math.random().toString();
                    
                    let displayDate = 'N/A';
                    if (app.date && app.timeSlot) {
                       const pureDate = app.date.split('T')[0];
                       const [y, m, d] = pureDate.split('-');
                       displayDate = `${d}/${m}/${y} at ${app.timeSlot}`;
                    } else if (app.scheduledAt) {
                       const pureDate = app.scheduledAt.split('T')[0];
                       const [y, m, d] = pureDate.split('-');
                       const dt = new Date(app.scheduledAt);
                       displayDate = `${d}/${m}/${y} at ${dt.getHours().toString().padStart(2,'0')}:${dt.getMinutes().toString().padStart(2,'0')}`;
                    }

                    const isAppBooking = !!app.txnId || !!app.timeSlot;
                    const isVip = app.appointmentType === 'vip';

                    return (
                      <tr key={safeId} className="hover:bg-orange-50/20 transition-colors">
                         <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">{displayDate}</td>
                         <td className="px-6 py-4 font-bold text-gray-900">{app.user?.name || 'N/A'}</td>
                         <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${isVip ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                               {isVip ? 'VIP' : 'NORMAL'}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-gray-500">{app.user?.phone || 'N/A'}</td>
                         <td className="px-6 py-4 text-center">
                            {isAppBooking ? (
                               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Yes</span>
                            ) : (
                               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">No</span>
                            )}
                         </td>
                         <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                            <select 
                               value={app.status}
                               onChange={(e) => handleStatusChange(safeId, e.target.value)}
                               className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary font-medium text-gray-700 outline-none cursor-pointer"
                            >
                               {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
                            </select>
                            <button 
                              onClick={() => handleDeleteAppointment(safeId)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Appointment"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                         </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
          )}
        </div>
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
                  {users.map(u => <option key={u.id || u._id} value={u.id || u._id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Title (Optional)</label>
                <input type="text" placeholder="Defaults to standard/VIP if blank" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time Slot *</label>
                  <select value={form.timeSlot} onChange={e => setForm({...form, timeSlot: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all disabled:bg-gray-100" disabled={isLoadingSlots || availableSlots.length === 0}>
                    {isLoadingSlots ? <option value="">Loading...</option> : 
                      availableSlots.length === 0 ? <option value="">None Available</option> :
                      availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)
                    }
                  </select>
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