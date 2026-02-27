import { useEffect, useState } from 'react';
import { Plus, X, Calendar, Clock, DollarSign, Check, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext'; 

interface Service { id: string; name: string; price: number; duration: number; }
interface User { id: string; email: string; name: string; }
interface Appointment { id: string; user: User; service: Service; scheduledAt: string; status: string; notes: string; isPaid: boolean; paymentAmount: number; }

export default function AppointmentsPage() {
  const { setActiveTab } = useApp(); // To switch tabs automatically
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({ user_id: '', service_id: '', scheduled_at: new Date().toISOString().split('T')[0], scheduled_time: '10:00', notes: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptsRes, servRes, usrRes] = await Promise.all([fetch('http://localhost:3001/api/appointments'), fetch('http://localhost:3001/api/services'), fetch('http://localhost:3001/api/users')]);
      const appts = await apptsRes.json(); const serv = await servRes.json(); const usr = await usrRes.json();
      if (appts.success) setAppointments(appts.data); if (serv.success) setServices(serv.data); if (usr.success) setUsers(usr.data);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateAppointment = async () => {
    if (!form.user_id || !form.service_id) return;
    try {
      const scheduled_at = new Date(`${form.scheduled_at}T${form.scheduled_time}`).toISOString();
      const response = await fetch('http://localhost:3001/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, scheduled_at }) });
      const result = await response.json();
      
      if (result.success) {
        setAppointments([result.data, ...appointments]);
        setShowModal(false);
        
        // AUTO GENERATE UPCOMING INVOICE IN PAYMENTS SYSTEM
        await fetch('http://localhost:3001/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: form.user_id,
            amount: result.data.paymentAmount,
            reason: `Appointment - ${result.data.service.name}`,
            dueDate: scheduled_at,
            status: 'upcoming',
            appointment_id: result.data.id
          })
        });
      }
    } catch (error) { console.error(error); }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      const result = await response.json();
      if (result.success) setAppointments(appointments.map(a => a.id === appointmentId ? result.data : a));
    } catch (error) { console.error(error); }
  };

  // REDIRECT TO BILLING WITH AUTO-FILL
  const handleRouteToPayment = (appointment: Appointment) => {
    const draftData = {
      user_id: appointment.user.id,
      amount: appointment.paymentAmount,
      reason: `Appointment - ${appointment.service?.name || 'Service'}`,
      dueDate: appointment.scheduledAt.split('T')[0],
      status: 'paid'
    };
    
    // Save draft to local storage so the billing page can pick it up instantly
    localStorage.setItem('draftPayment', JSON.stringify(draftData));
    
    // Jump to the Billing Tab!
    setActiveTab('billing'); 
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await fetch(`http://localhost:3001/api/appointments/${appointmentId}`, { method: 'DELETE' });
      setAppointments(appointments.filter(a => a.id !== appointmentId));
    } catch (error) { console.error(error); }
  };

  const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="p-8 text-gray-500">Loading appointments...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-3xl font-bold text-gray-800">Appointments</h1><p className="text-gray-600 mt-1">Manage incoming appointment requests</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus size={18} /> New Appointment</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {statuses.map(status => (
          <div key={status} className="flex-shrink-0 w-80 bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h3 className="font-semibold text-gray-800 mb-4 capitalize flex items-center justify-between">
              <span>{status.replace('_', ' ')}</span>
              <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">{appointments.filter(a => a.status === status).length}</span>
            </h3>

            <div className="space-y-3">
              {appointments.filter(a => a.status === status).map(appointment => (
                <div key={appointment.id} className="p-3 rounded-lg border-l-4 border-l-blue-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-2">
                    <p className="font-semibold text-gray-800 text-sm">{appointment.service?.name || 'Unknown Service'}</p>
                    <p className="text-xs text-gray-600">{appointment.user?.name || 'Unknown User'}</p>
                  </div>

                  <div className="space-y-1 mb-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1"><Calendar size={12} /><span>{formatDate(appointment.scheduledAt)}</span></div>
                    <div className="flex items-center gap-1"><Clock size={12} /><span>{formatTime(appointment.scheduledAt)}</span></div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={12} />
                      <span>₹{appointment.paymentAmount} {appointment.isPaid ? <span className="text-green-600 font-semibold">(Paid)</span> : <span className="text-red-600 font-semibold">(Unpaid)</span>}</span>
                    </div>
                  </div>

                  {appointment.notes && <p className="text-xs text-gray-600 mb-3 italic">"{appointment.notes}"</p>}

                  <div className="flex flex-col gap-2">
                    {!appointment.isPaid && (
                      <button onClick={() => handleRouteToPayment(appointment)} className="w-full px-2 py-1.5 text-xs bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                        <ExternalLink size={12} /> Collect Payment
                      </button>
                    )}

                    <select value={status} onChange={e => handleStatusChange(appointment.id, e.target.value)} className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500">
                      {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
                    </select>

                    <button onClick={() => handleDeleteAppointment(appointment.id)} className="w-full px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-800">New Appointment</h2><button onClick={() => setShowModal(false)} className="p-1 text-gray-500 hover:text-gray-700"><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">User *</label><select value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Select User</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Service *</label><select value={form.service_id} onChange={e => setForm({...form, service_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Select Service</option>{services.map(s => <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Date *</label><input type="date" value={form.scheduled_at} onChange={e => setForm({...form, scheduled_at: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Time *</label><input type="time" value={form.scheduled_time} onChange={e => setForm({...form, scheduled_time: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreateAppointment} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create & Generate Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}