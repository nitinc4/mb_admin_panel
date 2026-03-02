import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, FolderOpen, ArrowLeft, Calendar, Eye } from 'lucide-react';
import BatchModal from '../components/BatchModal';
import ContentModal from '../components/ContentModal'; 
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

type EditableField = 'attendance' | 'assignment' | 'announcements' | 'tests';

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
  
  const [isContentModalOpen, setIsContentModalOpen] = useState(false); 
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null); 

  // Inline Editing States
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSavingField, setIsSavingField] = useState(false);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [batchesRes, tiersRes] = await Promise.all([
        fetch(`${API_URL}/api/batches`),
        fetch(`${API_URL}/api/tiers`)
      ]);
      
      const batchesData = await batchesRes.json();
      const tiersData = await tiersRes.json();
      
      if (batchesData.success) setBatches(batchesData.data || []);
      if (tiersData.success) setTiers(tiersData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchBatchContent = async (batchId: string) => {
    setIsLoadingContent(true);
    try {
      const res = await fetch(`${API_URL}/api/batches/${batchId}`);
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
      setEditingField(null); // Reset inline edit state when switching batches
    } else {
      setBatchDetails(null);
    }
  }, [viewingBatchId]);

  const handleDeleteBatch = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this batch and all its content?')) return;
    try {
      await fetch(`${API_URL}/api/batches/${id}`, { method: 'DELETE' });
      fetchInitialData();
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!window.confirm('Delete this content item?')) return;
    try {
      await fetch(`${API_URL}/api/content/${contentId}`, { method: 'DELETE' });
      if (viewingBatchId) {
        fetchBatchContent(viewingBatchId); 
        fetchInitialData(); 
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  // --- Handle Inline Save for Details View ---
  const handleSaveField = async () => {
    if (!viewingBatchId || !editingField || !batchDetails) return;
    setIsSavingField(true);
    
    const { batch } = batchDetails;
    
    // We rebuild the entire batch payload to satisfy the PUT endpoint
    const payload = {
      name: batch.name,
      description: batch.description,
      start_date: batch.start_date,
      end_date: batch.end_date,
      is_active: batch.isActive,
      tier_ids: batch.allowed_tiers?.map(t => t.id || t._id) || [],
      attendance: editingField === 'attendance' ? editValue : batch.attendance,
      assignment: editingField === 'assignment' ? editValue : batch.assignment,
      announcements: editingField === 'announcements' ? editValue : batch.announcements,
      tests: editingField === 'tests' ? editValue : batch.tests,
    };

    try {
      const res = await fetch(`${API_URL}/api/batches/${viewingBatchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditingField(null);
        fetchBatchContent(viewingBatchId); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingField(false);
    }
  };

  // --- Inline Field Renderer ---
  const renderEditableField = (
    field: EditableField, 
    title: string, 
    colorClass: string, 
    lightBg: string, 
    borderClass: string, 
    textColor: string
  ) => {
    const isEditing = editingField === field;
    const value = batchDetails?.batch[field] || '';

    return (
      <div className={`${lightBg} p-4 rounded-lg border ${borderClass} relative group transition-all`}>
         <div className="flex justify-between items-start mb-2">
           <span className={`font-semibold ${colorClass} block`}>{title}</span>
           {!isEditing && (
             <button 
               onClick={() => { setEditingField(field); setEditValue(value); }} 
               className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
               title="Edit"
             >
               <Edit className="w-4 h-4" />
             </button>
           )}
         </div>
         
         {isEditing ? (
           <div className="mt-2">
             <textarea 
               autoFocus
               value={editValue}
               onChange={(e) => setEditValue(e.target.value)}
               className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-800"
               rows={3}
               placeholder={`Enter ${title.toLowerCase()} details...`}
             />
             <div className="flex gap-2 mt-3 justify-end">
               <button 
                 onClick={() => setEditingField(null)} 
                 disabled={isSavingField} 
                 className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSaveField} 
                 disabled={isSavingField} 
                 className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded hover:opacity-90 transition-opacity"
               >
                 {isSavingField ? 'Saving...' : 'Save'}
               </button>
             </div>
           </div>
         ) : (
           <div 
             onClick={() => { setEditingField(field); setEditValue(value); }} 
             className="cursor-text min-h-[40px] rounded hover:bg-white/50 p-1 -ml-1 transition-colors"
           >
             <p className={`${textColor} whitespace-pre-wrap ${!value ? 'italic opacity-60 text-sm' : ''}`}>
               {value || 'Click here to add...'}
             </p>
           </div>
         )}
      </div>
    );
  };

  const filteredBatches = (batches || []).filter((batch) =>
    (batch.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
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
    const safeContent = content || [];

    return (
      <div className="p-8 bg-cream min-h-full">
        <div className="mb-8">
          <button
            onClick={() => setViewingBatchId(null)}
            className="flex items-center gap-2 text-primary hover:opacity-80 font-medium mb-3 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Batches
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800">{batch.name}</h1>
          <p className="text-gray-600 mt-2 text-lg">{batch.description || "No description provided."}</p>
          
          <div className="flex gap-6 mt-4 text-sm text-gray-700">
             <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-semibold">Start:</span> {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'TBA'}
             </div>
             <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-semibold">End:</span> {batch.end_date ? new Date(batch.end_date).toLocaleDateString() : 'TBA'}
             </div>
          </div>

          {/* INLINE EDITABLE FIELDS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-sm">
             {renderEditableField('attendance', 'Attendance', 'text-blue-800', 'bg-blue-50', 'border-blue-100', 'text-blue-900')}
             {renderEditableField('assignment', 'Assignment', 'text-purple-800', 'bg-purple-50', 'border-purple-100', 'text-purple-900')}
             {renderEditableField('announcements', 'Announcements', 'text-orange-800', 'bg-orange-50', 'border-orange-100', 'text-orange-900')}
             {renderEditableField('tests', 'Tests', 'text-green-800', 'bg-green-50', 'border-green-100', 'text-green-900')}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Content Items</h2>
            <button 
              onClick={() => { setSelectedContent(null); setIsContentModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" /> Add Content
            </button>
          </div>

          {isLoadingContent ? (
             <p className="text-gray-500">Loading content...</p>
          ) : safeContent.length === 0 ? (
             <p className="text-gray-500 italic p-4 text-center border rounded border-dashed border-gray-300">No content items in this batch yet.</p>
          ) : (
            <div className="space-y-4">
              {safeContent.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-orange-50/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.contentType === 'video' ? 'bg-orange-100' : 'bg-red-100'}`}>
                      <FolderOpen className={`w-6 h-6 ${item.contentType === 'video' ? 'text-primary' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      <p className="text-sm font-medium text-gray-500">
                        {item.contentType === 'video'
                          ? `Duration: ${Math.floor((item.duration || 0) / 60)} min`
                          : `Size: ${((item.fileSize || 0) / 1024 / 1024).toFixed(1)} MB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <button onClick={() => { setSelectedContent(item); setIsContentModalOpen(true); }} className="p-2 text-primary hover:bg-orange-100 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteContent(item.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isContentModalOpen && (
          <ContentModal
            content={selectedContent}
            batchId={viewingBatchId}
            onClose={() => { setIsContentModalOpen(false); setSelectedContent(null); }}
            onSave={() => {
              setIsContentModalOpen(false);
              setSelectedContent(null);
              fetchBatchContent(viewingBatchId); 
              fetchInitialData(); 
            }}
          />
        )}
      </div>
    );
  }

  // ----- VIEW 2: MAIN BATCHES LIST -----
  return (
    <div className="p-8 bg-cream min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Batches & Content</h1>
        <p className="text-gray-600 mt-1">Manage batches and their content</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search batches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <button onClick={handleAddNewBatch} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-sm">
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
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Batch Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Access Tiers</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredBatches.length === 0 ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">No batches found.</td></tr>
                ) : filteredBatches.map((batch) => (
                  <tr 
                    key={batch.id} 
                    className="hover:bg-orange-50/30 cursor-pointer transition-colors"
                    onClick={() => setViewingBatchId(batch.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{batch.name}</div>
                      <div className="text-sm font-medium text-gray-500 line-clamp-1">{batch.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-600">
                        {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'N/A'} -{' '}
                        {batch.end_date ? new Date(batch.end_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">
                        {batch.content_count || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {batch.allowed_tiers && batch.allowed_tiers.length > 0 ? batch.allowed_tiers.map((tier, index) => (
                          <span key={tier.id || index} className="px-3 py-1 text-xs font-bold rounded-full bg-orange-100 text-primary">
                            {tier.name}
                          </span>
                        )) : <span className="text-sm font-medium text-gray-400">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${batch.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {batch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingBatchId(batch.id); }} 
                          className="p-2 text-gray-500 hover:text-primary hover:bg-orange-100 rounded-lg transition-colors"
                          title="View Content"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditBatch(batch); }} 
                          className="p-2 text-primary hover:bg-orange-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteBatch(batch.id); }} 
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        >
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
            // If editing the currently viewed batch, refresh details too
            if (viewingBatchId === selectedBatch?.id) {
               fetchBatchContent(viewingBatchId);
            }
          }}
        />
      )}
    </div>
  );
}