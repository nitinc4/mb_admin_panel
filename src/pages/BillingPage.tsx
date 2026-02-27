import { useState, useEffect } from 'react';

import { Search, Plus, Calendar, IndianRupee, AlertCircle, CheckCircle, ShieldAlert, Trash2 } from 'lucide-react';

interface User { id: string; name: string; phone: string; isBlocked: boolean; }
interface Payment {
  id: string; user: User; amount: number; paymentType: string; reason: string; referenceId: string; dueDate: string; paymentDate?: string; status: 'upcoming' | 'due' | 'paid';
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'due' | 'history' | 'add'>('upcoming');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Payment Form State
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [form, setForm] = useState({
    user_id: '', amount: 0, paymentType: 'upi', reason: '', referenceId: '', dueDate: new Date().toISOString().split('T')[0], status: 'paid' as any
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, usersRes] = await Promise.all([fetch('http://localhost:3001/api/payments'), fetch('http://localhost:3001/api/users')]);
      const paymentsData = await paymentsRes.json();
      const usersData = await usersRes.json();
      if (paymentsData.success) setPayments(paymentsData.data);
      if (usersData.success) setUsers(usersData.data);
    } catch (error) { console.error('Error fetching billing data:', error); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    // Check if Appointments Page sent a draft payment request via LocalStorage
    const draft = localStorage.getItem('draftPayment');
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      setForm(prev => ({ ...prev, ...parsedDraft }));
      setActiveTab('add');

      // Auto-fill the search box text to look nice
      const draftUser = users.find(u => u.id === parsedDraft.user_id);
      if (draftUser) setSearchTerm(`${draftUser.name} - ${draftUser.phone}`);

      localStorage.removeItem('draftPayment');
    }
  }, [users.length]); // Re-run effect once users are loaded so draft lookup works

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user_id) return alert("Select a user first!");
    try {
      const body = { ...form, paymentDate: form.status === 'paid' ? new Date().toISOString() : null };
      const res = await fetch('http://localhost:3001/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) {
        setPayments([...payments, result.data]);
        alert("Payment Added Successfully!");
        setActiveTab('history');
      }
    } catch (error) { console.error(error); }
  };

  const handleMarkPaid = async (paymentId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/payments/${paymentId}`, {
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
      await fetch(`http://localhost:3001/api/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isBlocked: true }) });
      alert("User blocked successfully.");
      fetchData(); // refresh to show updated status
    } catch (error) { console.error(error); }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm("Are you sure you want to delete this payment record permanently?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/payments/${paymentId}`, { method: 'DELETE' });
      if (res.ok) {
        setPayments(payments.filter(p => p.id !== paymentId));
      }
    } catch (error) { console.error("Failed to delete payment:", error); }
  };

  const filteredUsers = users.filter(u => u.phone?.includes(searchTerm) || (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  // Because the tab is called "history" but the DB status is "paid"
  const currentPayments = payments.filter(p => activeTab === 'history' ? p.status === 'paid' : p.status === activeTab);
  if (loading) return <div className="p-8 text-gray-500">Loading Billing...</div>;

  return (
    <div className="p-8">
      <div className="mb-6"><h1 className="text-3xl font-bold text-gray-800">Billing & Payments</h1></div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {['upcoming', 'due', 'history', 'add'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-4 font-medium capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              {tab === 'add' ? '+ Add/Record Payment' : tab + ' Payments'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'add' ? (
            <form onSubmit={handleAddPayment} className="max-w-2xl space-y-5">
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Customer Search (Phone/Name)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} placeholder="Search to select..." className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                {showDropdown && searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredUsers.map(u => (
                      <div key={u.id} onClick={() => { setForm({ ...form, user_id: u.id }); setSearchTerm(`${u.name} - ${u.phone}`); setShowDropdown(false); }} className="p-3 hover:bg-blue-50 cursor-pointer border-b text-sm">
                        <span className="font-medium">{u.name}</span> <span className="text-gray-500">({u.phone || 'No phone'})</span>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && <div className="p-3 text-sm text-gray-500">No users found</div>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Amount (₹)</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required /></div>
                <div><label className="block text-sm font-medium mb-1">Payment Type</label><select value={form.paymentType} onChange={e => setForm({ ...form, paymentType: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option></select></div>
              </div>

              <div><label className="block text-sm font-medium mb-1">Payment Reason</label><input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="e.g., Monthly Tier, Appointment" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required /></div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Reference ID (Txn ID)</label><input type="text" value={form.referenceId} onChange={e => setForm({ ...form, referenceId: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">Due / Payment Date</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required /></div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"><option value="paid">Already Paid</option><option value="upcoming">Upcoming/Invoice</option><option value="due">Overdue</option></select>
              </div>

              <button type="submit" className="w-full py-3 mt-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Record Payment</button>
            </form>
          ) : (
            <div className="grid gap-4">
              {currentPayments.length === 0 ? <p className="text-gray-500 text-center py-8">No payments found in this category.</p> : currentPayments.map(payment => (
                <div key={payment.id} className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white ${activeTab === 'due' ? 'border-red-200 shadow-sm' : 'border-gray-200'}`}>
                  <div>
                    <h3 className="font-bold text-gray-800">{payment.user?.name} <span className="text-sm font-normal text-gray-500">({payment.user?.phone || 'No Phone'})</span></h3>
                    <p className="text-sm text-gray-600">{payment.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                    {payment.referenceId && <p className="text-xs text-gray-400 font-mono mt-1">Ref: {payment.referenceId}</p>}
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto">
                    <div className="text-lg font-bold text-gray-800">₹{payment.amount}</div>

                    {activeTab === 'due' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleMarkPaid(payment.id)} className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-bold rounded flex items-center gap-1 transition-colors"><CheckCircle size={14} /> Mark Paid</button>
                        {!payment.user?.isBlocked && <button onClick={() => handleBlockUser(payment.user.id)} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold rounded flex items-center gap-1 transition-colors"><ShieldAlert size={14} /> Block User</button>}
                      </div>
                    )}

                    {activeTab === 'upcoming' && <button onClick={() => handleMarkPaid(payment.id)} className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold rounded transition-colors">Record as Paid</button>}
                    {activeTab === 'history' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">Paid via {payment.paymentType.toUpperCase()}</span>
                        <button onClick={() => handleDeletePayment(payment.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                      </div>
                    )}                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}