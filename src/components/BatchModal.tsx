import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { API_URL } from '../config';

interface Tier { id: string; name: string; }
interface Batch {
  id: string;
  name: string;
  description: string;
  attendance?: string;
  assignment?: string;
  announcements?: string;
  tests?: string;
  start_date: string;
  end_date: string;
  isActive: boolean;
  allowed_tiers: Array<{ _id?: string; id?: string; name: string }>;
}

interface BatchModalProps {
  batch: Batch | null;
  tiers: Tier[]; 
  onClose: () => void;
  onSave: () => void;
}

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

export default function BatchModal({ batch, tiers, onClose, onSave }: BatchModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    attendance: '',    // Kept in state to preserve existing data on update
    assignment: '',    // Kept in state to preserve existing data on update
    announcements: '', // Kept in state to preserve existing data on update
    tests: '',         // Kept in state to preserve existing data on update
    start_date: '',
    end_date: '',
    is_active: true,
    tier_ids: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeTiers = tiers || [];

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name || '',
        description: batch.description || '',
        attendance: batch.attendance || '',       // Preserve data
        assignment: batch.assignment || '',       // Preserve data
        announcements: batch.announcements || '', // Preserve data
        tests: batch.tests || '',                 // Preserve data
        start_date: formatDateForInput(batch.start_date),
        end_date: formatDateForInput(batch.end_date),
        is_active: batch.isActive ?? true,
        tier_ids: Array.isArray(batch.allowed_tiers) ? batch.allowed_tiers.map((t) => t.id || t._id || '') : [],
      });
    }
  }, [batch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = batch 
        ? `${API_URL}/api/batches/${batch.id}` 
        : `${API_URL}/api/batches`;

      const response = await fetch(url, {
        method: batch ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSave();
      } else {
        console.error('Failed to save batch');
      }
    } catch (error) {
      console.error('Error saving batch:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTierToggle = (tierId: string) => {
    setFormData((prev) => ({
      ...prev,
      tier_ids: (prev.tier_ids || []).includes(tierId)
        ? prev.tier_ids.filter((id) => id !== tierId)
        : [...prev.tier_ids, tierId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200 z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {batch ? 'Edit Batch' : 'Create New Batch'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overview / Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Restrictions</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
              {safeTiers.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">No tiers found. Create a tier first.</p>
              ) : safeTiers.map((tier) => (
                <label key={tier.id} className="flex items-center p-2 hover:bg-white cursor-pointer rounded border border-transparent hover:border-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.tier_ids.includes(tier.id)}
                    onChange={() => handleTierToggle(tier.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">{tier.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Select which user tiers can access this batch</p>
          </div>

          <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">Active batch</label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
              {isSubmitting ? 'Saving...' : (batch ? 'Update Batch' : 'Create Batch')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}