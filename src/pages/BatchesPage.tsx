import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Eye, FolderOpen, ArrowLeft } from 'lucide-react';
import BatchModal from '../components/BatchModal';
import ContentModal from '../components/ContentModal'; // <-- IMPORTED NEW MODAL

interface Tier { id: string; name: string; }
interface Batch {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  isActive: boolean;
  content_count: number;
  allowed_tiers: Array<{ _id?: string; id?: string; name: string }>;
  createdAt: string;
}

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  contentType: 'video' | 'pdf';
  duration: number;
  fileSize: number;
  isPublished: boolean;
}

export default function BatchesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [batches, setBatches] = useState<Batch[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Batch Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  
  // Content Modals & Details View
  const [viewingBatchId, setViewingBatchId] = useState<string | null>(null);
  const [batchDetails, setBatchDetails] = useState<{ batch: Batch, content: ContentItem[] } | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  
  const [isContentModalOpen, setIsContentModalOpen] = useState(false); // <-- CONTENT MODAL STATE
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null); // <-- CONTENT MODAL STATE

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [batchesRes, tiersRes] = await Promise.all([
        fetch('http://localhost:3001/api/batches'),
        fetch('http://localhost:3001/api/tiers')
      ]);
      
      const batchesData = await batchesRes.json();
      const tiersData = await tiersRes.json();
      
      if (batchesData.success) setBatches(batchesData.data);
      if (tiersData.success) setTiers(tiersData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Extracted fetch function so we can call it after saving new content!
  const fetchBatchContent = async (batchId: string) => {
    setIsLoadingContent(true);
    try {
      const res = await fetch(`http://localhost:3001/api/batches/${batchId}`);
      const data = await res.json();
      if (data.success) {
        setBatchDetails({
          batch: data.data,
          content: data.data.content_items || []
        });
      }
    } catch (error) {
      console.error('Error fetching batch content:', error);
    } finally {
      setIsLoadingContent(false);
    }
  };

  useEffect(() => {
    if (viewingBatchId) {
      fetchBatchContent(viewingBatchId);
    } else {
      setBatchDetails(null);
    }
  }, [viewingBatchId]);

  const handleDeleteBatch = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this batch and all its content?')) return;
    try {
      await fetch(`http://localhost:3001/api/batches/${id}`, { method: 'DELETE' });
      fetchInitialData();
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!window.confirm('Delete this content item?')) return;
    try {
      await fetch(`http://localhost:3001/api/content/${contentId}`, { method: 'DELETE' });
      if (viewingBatchId) {
        fetchBatchContent(viewingBatchId); // Refresh inner content view
        fetchInitialData(); // Refresh outer batch item counts
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const filteredBatches = batches.filter((batch) =>
    (batch.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsBatchModalOpen(true);
  };

  const handleAddNewBatch = () => {
    setSelectedBatch(null);
    setIsBatchModalOpen(true);
  };

  // ----- VIEW 1: DETAILED CONTENT VIEW -----
  if (viewingBatchId && batchDetails) {
    const { batch, content } = batchDetails;
    return (
      <div className="p-8">
        <div className="mb-6">
          <button
            onClick={() => setViewingBatchId(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Batches
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{batch.name}</h1>
          <p className="text-gray-600 mt-1">{batch.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Content Items</h2>
            {/* <-- CONNECTED ADD BUTTON --> */}
            <button 
              onClick={() => { setSelectedContent(null); setIsContentModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" /> Add Content
            </button>
          </div>

          {isLoadingContent ? (
             <p className="text-gray-500">Loading content...</p>
          ) : content.length === 0 ? (
             <p className="text-gray-500 italic p-4 text-center border rounded border-dashed border-gray-300">No content items in this batch yet.</p>
          ) : (
            <div className="space-y-4">
              {content.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.contentType === 'video' ? 'bg-blue-100' : 'bg-red-100'}`}>
                      <FolderOpen className={`w-6 h-6 ${item.contentType === 'video' ? 'text-blue-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-500">
                        {item.contentType === 'video'
                          ? `Duration: ${Math.floor((item.duration || 0) / 60)} min`
                          : `Size: ${((item.fileSize || 0) / 1024 / 1024).toFixed(1)} MB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {/* <-- CONNECTED EDIT BUTTON --> */}
                    <button onClick={() => { setSelectedContent(item); setIsContentModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteContent(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* <-- CONTENT MODAL RENDER --> */}
        {isContentModalOpen && (
          <ContentModal
            content={selectedContent}
            batchId={viewingBatchId}
            onClose={() => { setIsContentModalOpen(false); setSelectedContent(null); }}
            onSave={() => {
              setIsContentModalOpen(false);
              setSelectedContent(null);
              fetchBatchContent(viewingBatchId); // Refresh inner list
              fetchInitialData(); // Refresh outer count
            }}
          />
        )}
      </div>
    );
  }

  // ----- VIEW 2: MAIN BATCHES LIST -----
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
            <button onClick={handleAddNewBatch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" /> Add Batch
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading batches from database...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Tiers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBatches.length === 0 ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">No batches found.</td></tr>
                ) : filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{batch.name}</div>
                      <div className="text-sm text-gray-500">{batch.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'N/A'} -{' '}
                        {batch.end_date ? new Date(batch.end_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {batch.content_count || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {batch.allowed_tiers?.length ? batch.allowed_tiers.map((tier, index) => (
                          <span key={tier.id || index} className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {tier.name}
                          </span>
                        )) : <span className="text-sm text-gray-400">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${batch.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {batch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setViewingBatchId(batch.id)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="View Content">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEditBatch(batch)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteBatch(batch.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isBatchModalOpen && (
        <BatchModal
          batch={selectedBatch}
          tiers={tiers}
          onClose={() => {
            setIsBatchModalOpen(false);
            setSelectedBatch(null);
          }}
          onSave={() => {
            setIsBatchModalOpen(false);
            setSelectedBatch(null);
            fetchInitialData();
          }}
        />
      )}
    </div>
  );
}