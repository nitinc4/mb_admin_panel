import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  contentType: 'video' | 'pdf';
  fileUrl?: string;
  duration?: number;
  fileSize?: number;
  isPublished: boolean;
}

interface ContentModalProps {
  content: ContentItem | null;
  batchId: string;
  onClose: () => void;
  onSave: () => void;
}

export default function ContentModal({ content, batchId, onClose, onSave }: ContentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'video' as 'video' | 'pdf',
    duration: 0,
    is_published: true,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title,
        description: content.description || '',
        content_type: content.contentType,
        duration: content.duration || 0,
        is_published: content.isPublished,
      });
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = content
        ? `http://localhost:3001/api/content/${content.id}`
        : 'http://localhost:3001/api/content';

      const response = await fetch(url, {
        method: content ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: batchId,
          title: formData.title,
          description: formData.description,
          content_type: formData.content_type,
          duration: formData.duration,
          is_published: formData.is_published,
          // Since Firebase is on hold, we send dummy data or keep the existing URL
          file_url: content?.fileUrl || '', 
          file_size: selectedFile ? selectedFile.size : (formData.content_type === 'video' ? 15000000 : 2500000)
        }),
      });

      if (response.ok) {
        onSave();
      } else {
        console.error('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200 z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {content ? 'Edit Content' : 'Add New Content'}
          </h2>
          <button onClick={!isSubmitting ? onClose : undefined} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
            <div className="flex gap-4">
              <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                <input
                  type="radio"
                  value="video"
                  checked={formData.content_type === 'video'}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value as 'video' | 'pdf' })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 font-medium text-gray-700">Video</span>
              </label>
              <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                <input
                  type="radio"
                  value="pdf"
                  checked={formData.content_type === 'pdf'}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value as 'video' | 'pdf' })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 font-medium text-gray-700">PDF</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
            <label className={`block border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isSubmitting ? 'border-gray-300 bg-gray-50 opacity-50' : 'border-gray-300 hover:border-blue-500 cursor-pointer'}`}>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              
              {selectedFile ? (
                <div className="text-blue-600 font-medium mb-1">{selectedFile.name}</div>
              ) : content?.fileUrl ? (
                <div className="text-green-600 font-medium mb-1">File attached. Click to replace.</div>
              ) : (
                <p className="text-sm text-gray-600 mb-1">Click to select a file</p>
              )}
              
              <p className="text-xs text-gray-500">
                {formData.content_type === 'video' ? 'MP4, MOV, AVI up to 500MB' : 'PDF up to 50MB'}
              </p>
              <input
                type="file"
                accept={formData.content_type === 'video' ? 'video/*' : 'application/pdf'}
                className="hidden"
                disabled={isSubmitting}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
            </label>
            <p className="text-xs text-blue-600 font-medium mt-2">
              Note: Cloud Storage is on hold. A dummy URL will be generated automatically.
            </p>
          </div>

          {formData.content_type === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">Publish immediately</label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
              {isSubmitting ? 'Saving...' : (content ? 'Update Content' : 'Save Content')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}