import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { API_URL } from '../config';

interface Batch {
  id: string;
  name: string;
}

interface LiveClass {
  id: string;
  batch: Batch;
  title: string;
  scheduledAt: string | null;
  duration: number;
}

interface LiveClassModalProps {
  liveClass: LiveClass | null;
  batches: Batch[];
  onClose: () => void;
  onSave: () => void;
}

const getLocalToday = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function LiveClassModal({ liveClass, batches, onClose, onSave }: LiveClassModalProps) {
  const [formData, setFormData] = useState({
    batch_id: batches.length > 0 ? batches[0].id : '',
    title: '',
    duration: 60,
    scheduledDate: getLocalToday(),
    scheduledTime: '10:00',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (liveClass) {
      let sd = '';
      let st = '';
      
      if (liveClass.scheduledAt) {
        // Fix: Use local methods instead of toISOString() to prevent timezone shifting
        const date = new Date(liveClass.scheduledAt);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        
        sd = `${y}-${m}-${d}`;
        st = `${h}:${min}`;
      }
      
      setFormData({
        batch_id: liveClass.batch?.id || '',
        title: liveClass.title,
        duration: liveClass.duration,
        scheduledDate: sd || getLocalToday(),
        scheduledTime: st || '10:00',
      });
    } else if (batches.length > 0) {
      setFormData(prev => ({ ...prev, batch_id: batches[0].id }));
    }
  }, [liveClass, batches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
      
      const payload = {
        batch_id: formData.batch_id,
        title: formData.title,
        duration: formData.duration,
        scheduled_at: scheduledAt,
      };

      const url = liveClass 
        ? `${API_URL}/api/live-classes/${liveClass.id}` 
        : `${API_URL}/api/live-classes`;

      const response = await fetch(url, {
        method: liveClass ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      } else {
        console.error('Failed to save live class');
      }
    } catch (error) {
      console.error('Error saving live class:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {liveClass ? 'Edit Live Class' : 'Schedule Live Class'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Select Batch *</label>
            <select
              value={formData.batch_id}
              onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              required
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Class Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Chapter 1: Introduction"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Date *</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Time *</label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Duration (Minutes) *</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              required
              min="1"
            />
          </div>

          <div className="flex gap-3 mt-8 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}