import { useEffect, useState } from 'react';
import { Plus, X, Calendar, Clock, DollarSign, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext'; 
import { API_URL } from '../config';

interface User { id: string; email: string; name: string; }
interface Appointment { id: string; user: User; title: string; cost: number; scheduledAt: string; status: string; notes: string; isPaid: boolean; paymentAmount: number; }

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

  const [form, setForm] = useState({ user_id: '', title: '', cost: 0, scheduled_at: getLocalToday(), scheduled_time: '10:00', notes: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptsRes, usrRes] = await Promise.all([fetch(`${API_URL}/api/appointments`), fetch(`${API_URL}/api/users`)]);
      const appts = await apptsRes.json(); const usr = await usrRes.json();
      if (appts.success) setAppointments(appts.data); if (usr.success) setUsers(usr.data);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

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
        
        if (result.data.cost > 0) {
          await fetch(`${API_URL}/api/payments`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: form.user_id, amount: result.data.cost, reason: `Appointment - ${result.data.title}`, dueDate: scheduled_at, status: 'upcoming', appointment_id: result.data.id
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
      if (result.success) setAppointments(appointments.map(a => a.id === appointmentId ? result.data : a));
    } catch (error) { console.error(error); }
  };

  const handleRouteToPayment = (appointment: Appointment) => {
    const draftData = {
      user_id: appointment.user.id, amount: appointment.paymentAmount, reason: `Appointment - ${appointment.title}`, dueDate: appointment.scheduledAt.split('T')[0], status: 'paid'
    };
    localStorage.setItem('draftPayment', JSON.stringify(draftData));
    setActiveTab('billing'); 
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await fetch(`${API_URL}/api/appointments/${appointmentId}`, { method: 'DELETE' });
      setAppointments(appointments.filter(a => a.id !== appointmentId));
    } catch (error) { console.error(error); }
  };

  const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

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

      <div className="flex flex-nowrap overflow-x-auto gap-6 pb-6 items-start">
        {statuses.map(status => {
          const colAppointments = appointments.filter(a => a.status === status);
          
          return (
            <div key={status} className="flex-shrink-0 w-80 bg-gray-50/50 rounded-xl shadow-sm border border-gray-200 flex flex-col max-h-[calc(100vh-180px)]">
              
              {/* SOLID HEADER STRIP - Keeps title fixed, prevents overlapping text */}
              <div className="px-5 py-4 bg-white border-b border-gray-200 rounded-t-xl flex items-center justify-between z-10 shadow-sm">
                <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">
                  {status.replace('_', ' ')}
                </h3>
                <span className="bg-orange-100 text-primary rounded-full min-w-[24px] h-6 px-1.5 flex items-center justify-center text-xs font-bold">
                  {colAppointments.length}
                </span>
              </div>

              {/* SCROLLABLE CONTENT AREA */}
              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {colAppointments.map(appointment => (
                  <div key={appointment.id} className="p-4 rounded-lg border border-gray-100 border-l-4 border-l-primary bg-white shadow-sm hover:shadow-md transition-all">
                    <div className="mb-3">
                      <p className="font-bold text-gray-800 text-sm">{appointment.title}</p>
                      <p className="text-xs text-gray-500">{appointment.user?.name || 'Unknown User'}</p>
                    </div>

                    <div className="space-y-1.5 mb-4 text-xs text-gray-600 font-medium">
                      <div className="flex items-center gap-2"><Calendar size={14} className="text-primary"/><span>{formatDate(appointment.scheduledAt)}</span></div>
                      <div className="flex items-center gap-2"><Clock size={14} className="text-primary"/><span>{formatTime(appointment.scheduledAt)}</span></div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-primary"/>
                        <span>₹{appointment.paymentAmount} {appointment.isPaid ? <span className="text-green-600 font-bold ml-1">(Paid)</span> : <span className="text-red-500 font-bold ml-1">(Unpaid)</span>}</span>
                      </div>
                    </div>

                    {appointment.notes && <p className="text-xs text-gray-600 mb-4 p-2 bg-orange-50/50 rounded border border-orange-100 italic">"{appointment.notes}"</p>}

                    <div className="flex flex-col gap-2">
                      {!appointment.isPaid && appointment.paymentAmount > 0 && (
                        <button onClick={() => handleRouteToPayment(appointment)} className="w-full px-2 py-2 text-xs bg-orange-50 text-primary font-bold border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center gap-1">
                          <ExternalLink size={12} /> Collect Payment
                        </button>
                      )}

                      <select value={status} onChange={e => handleStatusChange(appointment.id, e.target.value)} className="w-full px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-primary focus:border-primary cursor-pointer outline-none">
                        {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
                      </select>

                      <button onClick={() => handleDeleteAppointment(appointment.id)} className="w-full px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {colAppointments.length === 0 && (
                  <div className="text-center text-gray-400 text-sm font-medium py-8">
                    No appointments
                  </div>
                )}
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