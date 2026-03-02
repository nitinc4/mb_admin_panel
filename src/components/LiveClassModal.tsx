import { useState, useEffect } from 'react';
import { X, Video } from 'lucide-react';
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
  batches: Batch[]; // <-- Real batches from the database
  onClose: () => void;
  onSave: () => void;
}

export default function LiveClassModal({ liveClass, batches, onClose, onSave }: LiveClassModalProps) {
  const [formData, setFormData] = useState({
    batch_id: '',
    title: '',
    scheduled_at: '',
    duration: 60,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (liveClass) {
      setFormData({
        batch_id: liveClass.batch.id,
        title: liveClass.title,
        scheduled_at: liveClass.scheduledAt
          ? new Date(liveClass.scheduledAt).toISOString().slice(0, 16)
          : '',
        duration: liveClass.duration,
      });
    }
  }, [liveClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = liveClass 
        ? `${API_URL}/api/live-classes/${liveClass.id}` 
        : `${API_URL}/api/live-classes`;

      const response = await fetch(url, {
        method: liveClass ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  const selectedBatch = batches.find((b) => b.id === formData.batch_id);
  const generatedMeetingId = selectedBatch
    ? `MantrikaBrahma_${selectedBatch.name.replace(/\s+/g, '_')}_${Date.now()}`
    : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {liveClass ? 'Edit Live Class' : 'Schedule New Live Class'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
            <select
              value={formData.batch_id}
              onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a batch...</option>
              {batches.map((batch: any) => (
                <option key={batch.id || batch._id} value={batch.id || batch._id}>
                  {batch.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Only users in the selected batch will be able to join this live class</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Live Class - Introduction to React Hooks"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
              <input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min="15"
                step="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {formData.batch_id && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Jitsi Meeting Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Meeting ID:</span>
                  <p className="text-blue-900 font-mono text-xs mt-1 break-all">{generatedMeetingId}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Meeting URL:</span>
                  <p className="text-blue-900 font-mono text-xs mt-1 break-all">https://meet.jit.si/{generatedMeetingId}</p>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-3">This URL will be automatically generated and shared with students in the selected batch</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
               {isSubmitting ? 'Saving...' : (liveClass ? 'Update Live Class' : 'Schedule Live Class')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}