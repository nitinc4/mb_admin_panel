import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Tier { id: string; name: string; }
interface User {
  id: string; email: string; name: string; phone: string; tier: Tier | null; isActive: boolean; billingCycle?: string;
}
interface UserModalProps {
  user: User | null; tiers: Tier[]; onClose: () => void; onSave: () => void;
}

export default function UserModal({ user, tiers, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState({
    email: '', full_name: '', phone: '', tier_id: '', billingCycle: 'monthly', is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        full_name: user.name, 
        phone: user.phone || '',
        tier_id: user.tier?.id || '',
        billingCycle: user.billingCycle || 'monthly',
        is_active: user.isActive,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = user ? `${API_URL}/api/users/${user.id}` : `${API_URL}/api/users`;
      const response = await fetch(url, {
        method: user ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), 
      });

      if (response.ok) onSave();
      else console.error('Failed to save user');
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Full Name</label><input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tier</label>
              <select value={formData.tier_id} onChange={(e) => setFormData({ ...formData, tier_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">No Tier</option>
                {tiers.map((tier) => <option key={tier.id} value={tier.id}>{tier.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Billing Cycle</label>
              <select value={formData.billingCycle} onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" disabled={!formData.tier_id}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">Active user account</label>
          </div>

          <div className="flex gap-3 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Saving...' : (user ? 'Update' : 'Create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}