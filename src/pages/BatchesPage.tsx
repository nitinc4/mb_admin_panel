import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Eye, FolderOpen } from 'lucide-react';
import BatchModal from '../components/BatchModal';

interface Batch {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  content_count: number;
  allowed_tiers: Array<{ id: string; name: string }>;
  created_at: string;
}

const mockBatches: Batch[] = [
  {
    id: '1',
    name: 'Advanced JavaScript 2024',
    description: 'Complete JavaScript course covering ES6+ features',
    start_date: '2024-01-15',
    end_date: '2024-06-15',
    is_active: true,
    content_count: 24,
    allowed_tiers: [
      { id: '1', name: 'Premium' },
      { id: '2', name: 'Enterprise' },
    ],
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'React Masterclass',
    description: 'Deep dive into React and modern frontend development',
    start_date: '2024-02-01',
    end_date: '2024-07-01',
    is_active: true,
    content_count: 32,
    allowed_tiers: [{ id: '2', name: 'Enterprise' }],
    created_at: '2024-01-15',
  },
  {
    id: '3',
    name: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js',
    start_date: '2024-03-01',
    end_date: '2024-08-01',
    is_active: false,
    content_count: 18,
    allowed_tiers: [
      { id: '1', name: 'Premium' },
      { id: '2', name: 'Enterprise' },
    ],
    created_at: '2024-02-15',
  },
];

export default function BatchesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [viewingBatchId, setViewingBatchId] = useState<string | null>(null);

  const filteredBatches = mockBatches.filter((batch) =>
    batch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsBatchModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedBatch(null);
    setIsBatchModalOpen(true);
  };

  const handleViewContent = (batchId: string) => {
    setViewingBatchId(batchId);
  };

  if (viewingBatchId) {
    const batch = mockBatches.find((b) => b.id === viewingBatchId);
    if (!batch) return null;

    return (
      <div className="p-8">
        <div className="mb-6">
          <button
            onClick={() => setViewingBatchId(null)}
            className="text-blue-600 hover:text-blue-700 font-medium mb-2"
          >
            ← Back to Batches
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{batch.name}</h1>
          <p className="text-gray-600 mt-1">{batch.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Content Items</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" />
              Add Content
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                id: '1',
                title: 'Introduction to the Course',
                type: 'video',
                duration: 1200,
                published: true,
              },
              {
                id: '2',
                title: 'Course Materials PDF',
                type: 'pdf',
                size: '2.4 MB',
                published: true,
              },
              {
                id: '3',
                title: 'Module 1: Getting Started',
                type: 'video',
                duration: 1800,
                published: true,
              },
            ].map((content) => (
              <div
                key={content.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      content.type === 'video' ? 'bg-blue-100' : 'bg-red-100'
                    }`}
                  >
                    <FolderOpen
                      className={`w-6 h-6 ${
                        content.type === 'video' ? 'text-blue-600' : 'text-red-600'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{content.title}</h3>
                    <p className="text-sm text-gray-500">
                      {content.type === 'video'
                        ? `Duration: ${Math.floor(content.duration / 60)} min`
                        : `Size: ${content.size}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      content.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {content.published ? 'Published' : 'Draft'}
                  </span>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Batches & Content</h1>
        <p className="text-gray-600 mt-1">Manage batches and their content</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search batches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Batch
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access Tiers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{batch.name}</div>
                    <div className="text-sm text-gray-500">{batch.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(batch.start_date).toLocaleDateString()} -{' '}
                      {new Date(batch.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {batch.content_count} items
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {batch.allowed_tiers.map((tier) => (
                        <span
                          key={tier.id}
                          className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                        >
                          {tier.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        batch.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {batch.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewContent(batch.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="View Content"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditBatch(batch)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isBatchModalOpen && (
        <BatchModal
          batch={selectedBatch}
          onClose={() => {
            setIsBatchModalOpen(false);
            setSelectedBatch(null);
          }}
          onSave={() => {
            setIsBatchModalOpen(false);
            setSelectedBatch(null);
          }}
        />
      )}
    </div>
  );
}
