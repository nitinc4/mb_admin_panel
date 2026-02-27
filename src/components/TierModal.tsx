import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Tier { 
  id: string; 
  name: string; 
  description: string; 
  monthlyPrice: number; 
  yearlyPrice: number; 
  lifetimePrice: number; 
}

interface TierModalProps { 
  tier: Tier | null; 
  onClose: () => void; 
  onSave: () => void; 
}

export default function TierModal({ tier, onClose, onSave }: TierModalProps) {
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    monthlyPrice: 0, 
    yearlyPrice: 0, 
    lifetimePrice: 0 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tier) {
      setFormData({ 
        name: tier.name, 
        description: tier.description || '', 
        monthlyPrice: tier.monthlyPrice || 0, 
        yearlyPrice: tier.yearlyPrice || 0, 
        lifetimePrice: tier.lifetimePrice || 0 
      });
    }
  }, [tier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = tier ? `http://localhost:3001/api/tiers/${tier.id}` : 'http://localhost:3001/api/tiers';
      const response = await fetch(url, {
        method: tier ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) onSave();
    } catch (error) {
      console.error('Error saving tier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{tier ? 'Edit Tier' : 'Add New Tier'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tier Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Monthly (₹)</label>
              <input type="number" value={formData.monthlyPrice} onChange={e => setFormData({...formData, monthlyPrice: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Yearly (₹)</label>
              <input type="number" value={formData.yearlyPrice} onChange={e => setFormData({...formData, yearlyPrice: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Lifetime (₹)</label>
              <input type="number" value={formData.lifetimePrice} onChange={e => setFormData({...formData, lifetimePrice: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}