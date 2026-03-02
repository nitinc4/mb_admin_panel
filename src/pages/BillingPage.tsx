import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Search, Plus, IndianRupee, CheckCircle, ShieldAlert, Trash2, X } from 'lucide-react';

interface User { id: string; name: string; phone: string; isBlocked: boolean; }
interface Payment {
  id: string; user: User; amount: number; paymentType: string; reason: string; referenceId: string; dueDate: string; paymentDate?: string; status: 'upcoming' | 'due' | 'paid';
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'due' | 'history'>('upcoming');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [form, setForm] = useState({
    user_id: '', amount: 0, paymentType: 'upi', reason: '', referenceId: '', dueDate: new Date().toISOString().split('T')[0], status: 'paid' as any
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, usersRes] = await Promise.all([fetch(`${API_URL}/api/payments`), fetch(`${API_URL}/api/users`)]);
      const paymentsData = await paymentsRes.json();
      const usersData = await usersRes.json();
      if (paymentsData.success) setPayments(paymentsData.data);
      if (usersData.success) setUsers(usersData.data);
    } catch (error) { console.error('Error fetching billing data:', error); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const draft = localStorage.getItem('draftPayment');
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      setForm(prev => ({ ...prev, ...parsedDraft }));
      setShowAddModal(true); // Open modal instead of switching tabs

      const draftUser = users.find(u => u.id === parsedDraft.user_id);
      if (draftUser) setSearchTerm(`${draftUser.name} - ${draftUser.phone}`);

      localStorage.removeItem('draftPayment');
    }
  }, [users.length]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user_id) return alert("Select a user first!");
    try {
      const body = { ...form, paymentDate: form.status === 'paid' ? new Date().toISOString() : null };
      const res = await fetch(`${API_URL}/api/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) {
        setPayments([...payments, result.data]);
        alert("Payment Added Successfully!");
        setShowAddModal(false);
        setActiveTab(form.status === 'paid' ? 'history' : form.status);
      }
    } catch (error) { console.error(error); }
  };

  const handleMarkPaid = async (paymentId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/payments/${paymentId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paid', paymentDate: new Date().toISOString() })
      });
      const result = await res.json();
      if (result.success) {
        setPayments(payments.map(p => p.id === paymentId ? result.data : p));
      }
    } catch (error) { console.error(error); }
  };

  const handleBlockUser = async (userId: string) => {
    if (!window.confirm("Block this user due to non-payment?")) return;
    try {
      await fetch(`${API_URL}/api/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isBlocked: true }) });
      alert("User blocked successfully.");
      fetchData(); 
    } catch (error) { console.error(error); }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm("Are you sure you want to delete this payment record permanently?")) return;
    try {
      const res = await fetch(`${API_URL}/api/payments/${paymentId}`, { method: 'DELETE' });
      if (res.ok) {
        setPayments(payments.filter(p => p.id !== paymentId));
      }
    } catch (error) { console.error("Failed to delete payment:", error); }
  };

  const filteredUsers = users.filter(u => u.phone?.includes(searchTerm) || (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const currentPayments = payments.filter(p => activeTab === 'history' ? p.status === 'paid' : p.status === activeTab);
  
  if (loading) return <div className="p-8 text-gray-500 bg-cream min-h-full">Loading Billing...</div>;

  return (
    <div className="p-8 bg-cream min-h-full">
      {/* HEADER WITH NEW BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Billing & Payments</h1>
          <p className="text-gray-600 mt-1">Manage user payments, invoices, and history</p>
        </div>
        <button 
          onClick={() => {
            setForm({ user_id: '', amount: 0, paymentType: 'upi', reason: '', referenceId: '', dueDate: new Date().toISOString().split('T')[0], status: 'paid' as any });
            setSearchTerm('');
            setShowAddModal(true);
          }} 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
        >
          <Plus size={18} /> Record Payment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* TABS (Removed the 'Add' tab) */}
        <div className="flex border-b border-gray-100 overflow-x-auto bg-white">
          {['upcoming', 'due', 'history'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-4 font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary hover:bg-orange-50/30'}`}>
              {tab} Payments
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            {currentPayments.length === 0 ? <p className="text-gray-500 font-medium text-center py-8">No payments found in this category.</p> : currentPayments.map(payment => (
              <div key={payment.id} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:shadow-sm transition-shadow ${activeTab === 'due' ? 'border-red-200 shadow-sm' : 'border-gray-100'}`}>
                <div>
                  <h3 className="font-bold text-gray-800">{payment.user?.name} <span className="text-sm font-medium text-gray-500">({payment.user?.phone || 'No Phone'})</span></h3>
                  <p className="text-sm font-medium text-gray-600 mt-1">{payment.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">Due: <span className="font-semibold">{new Date(payment.dueDate).toLocaleDateString()}</span></p>
                  {payment.referenceId && <p className="text-xs text-gray-400 font-mono mt-1">Ref: {payment.referenceId}</p>}
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto">
                  <div className="text-xl font-bold text-gray-800">₹{payment.amount}</div>

                  {activeTab === 'due' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleMarkPaid(payment.id)} className="px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"><CheckCircle size={14} /> Mark Paid</button>
                      {!payment.user?.isBlocked && <button onClick={() => handleBlockUser(payment.user.id)} className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"><ShieldAlert size={14} /> Block User</button>}
                    </div>
                  )}

                  {activeTab === 'upcoming' && <button onClick={() => handleMarkPaid(payment.id)} className="px-4 py-2 bg-orange-50 text-primary hover:bg-orange-100 text-xs font-bold rounded-lg transition-colors">Record as Paid</button>}
                  {activeTab === 'history' && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">Paid via {payment.paymentType.toUpperCase()}</span>
                      <button onClick={() => handleDeletePayment(payment.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  )}                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Record Payment</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-gray-400 hover:text-gray-800 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddPayment} className="space-y-5">
              <div className="relative">
                <label className="block text-sm font-semibold mb-1 text-gray-700">Customer Search (Phone/Name) *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} placeholder="Search to select..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" required={!form.user_id} />
                </div>
                {showDropdown && searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredUsers.map(u => (
                      <div key={u.id} onClick={() => { setForm({ ...form, user_id: u.id }); setSearchTerm(`${u.name} - ${u.phone}`); setShowDropdown(false); }} className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 text-sm">
                        <span className="font-bold text-gray-800">{u.name}</span> <span className="text-gray-500">({u.phone || 'No phone'})</span>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && <div className="p-3 text-sm text-gray-500 font-medium">No users found</div>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Amount (₹) *</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" required /></div>
                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Payment Type</label><select value={form.paymentType} onChange={e => setForm({ ...form, paymentType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option></select></div>
              </div>

              <div><label className="block text-sm font-semibold mb-1 text-gray-700">Payment Reason *</label><input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="e.g., Monthly Tier, Appointment" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" required /></div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Reference ID (Txn ID)</label><input type="text" value={form.referenceId} onChange={e => setForm({ ...form, referenceId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" /></div>
                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Due / Payment Date *</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" required /></div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"><option value="paid">Already Paid</option><option value="upcoming">Upcoming/Invoice</option><option value="due">Overdue</option></select>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 border border-gray-300 font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-sm">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}