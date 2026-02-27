import { useEffect, useState } from 'react';
import { Plus, X, Calendar, Clock, DollarSign, Check } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface Appointment {
  id: string;
  user: User;
  service: Service;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes: string;
  isPaid: boolean;
  paymentAmount: number;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<'kanban' | 'calendar'>('kanban');

  const [form, setForm] = useState({
    user_id: '',
    service_id: '',
    scheduled_at: new Date().toISOString().split('T')[0],
    scheduled_time: '10:00',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, servicesRes, usersRes] = await Promise.all([
        fetch('http://localhost:3001/api/appointments'),
        fetch('http://localhost:3001/api/services'),
        fetch('http://localhost:3001/api/users'),
      ]);

      const appointmentsData = await appointmentsRes.json();
      const servicesData = await servicesRes.json();
      const usersData = await usersRes.json();

      if (appointmentsData.success) setAppointments(appointmentsData.data || []);
      if (servicesData.success) setServices(servicesData.data || []);
      if (usersData.success) setUsers(usersData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!form.user_id || !form.service_id) return;

    try {
      const scheduled_at = new Date(`${form.scheduled_at}T${form.scheduled_time}`).toISOString();

      const response = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: form.user_id,
          service_id: form.service_id,
          scheduled_at,
          notes: form.notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAppointments([result.data, ...appointments]);
        setForm({
          user_id: '',
          service_id: '',
          scheduled_at: new Date().toISOString().split('T')[0],
          scheduled_time: '10:00',
          notes: '',
        });
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await response.json();

      if (result.success) {
        setAppointments(appointments.map((a) => (a.id === appointmentId ? result.data : a)));
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleMarkAsPaid = async (appointmentId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: true }),
      });

      const result = await response.json();

      if (result.success) {
        setAppointments(appointments.map((a) => (a.id === appointmentId ? result.data : a)));
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm('Delete this appointment?')) return;

    try {
      await fetch(`http://localhost:3001/api/appointments/${appointmentId}`, { method: 'DELETE' });
      setAppointments(appointments.filter((a) => a.id !== appointmentId));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter((a) => a.status === status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading appointments...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
        <p className="text-gray-600 mt-1">Manage incoming appointment requests</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setView('kanban')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'kanban' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Calendar
          </button>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> New Appointment
        </button>
      </div>

      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 auto-cols-max overflow-x-auto pb-4">
          {statuses.map((status) => (
            <div
              key={status}
              className="flex-shrink-0 w-80 bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-[calc(100vh-300px)] overflow-y-auto"
            >
              <h3 className="font-semibold text-gray-800 mb-4 capitalize flex items-center justify-between">
                <span>{status.replace('_', ' ')}</span>
                <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {getAppointmentsByStatus(status).length}
                </span>
              </h3>

              <div className="space-y-3">
                {getAppointmentsByStatus(status).map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-3 rounded-lg border-l-4 bg-white ${
                      status === 'pending'
                        ? 'border-l-yellow-500'
                        : status === 'confirmed'
                          ? 'border-l-blue-500'
                          : status === 'in_progress'
                            ? 'border-l-purple-500'
                            : status === 'completed'
                              ? 'border-l-green-500'
                              : 'border-l-red-500'
                    } shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <div className="mb-2">
                      <p className="font-semibold text-gray-800 text-sm">
                        {appointment.service?.name || 'Unknown Service'}
                      </p>
                      <p className="text-xs text-gray-600">{appointment.user?.name || 'Unknown User'}</p>
                    </div>

                    <div className="space-y-1 mb-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{formatDate(appointment.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{formatTime(appointment.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={12} />
                        <span>
                          ₹{appointment.paymentAmount.toFixed(2)}{' '}
                          {appointment.isPaid ? (
                            <span className="text-green-600 font-semibold">(Paid)</span>
                          ) : (
                            <span className="text-red-600 font-semibold">(Unpaid)</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <p className="text-xs text-gray-600 mb-3 italic">"{appointment.notes}"</p>
                    )}

                    <div className="flex flex-col gap-2">
                      {!appointment.isPaid && (
                        <button
                          onClick={() => handleMarkAsPaid(appointment.id)}
                          className="w-full px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Check size={12} /> Mark Paid
                        </button>
                      )}

                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="w-full px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'calendar' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center text-gray-600">
            <p className="mb-2">Calendar view coming soon</p>
            <p className="text-sm">Use the Kanban view to manage appointments</p>
          </div>
        </div>
      )}

      {/* Create Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">New Appointment</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User *</label>
                <select
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
                <select
                  value={form.service_id}
                  onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Service</option>
                  {services.length === 0 && <option disabled>No services available. Add one via backend first.</option>}
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} (₹{service.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                <input
                  type="time"
                  value={form.scheduled_time}
                  onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAppointment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}