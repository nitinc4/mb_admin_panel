import { useState, useEffect } from 'react';
import { Plus, Video, Calendar, Clock, ExternalLink, Play, Square, Edit, Trash2 } from 'lucide-react';
import LiveClassModal from '../components/LiveClassModal';
import { API_URL } from '../config';

interface Batch { id: string; name: string; }
interface LiveClass {
  id: string; batch: Batch; title: string; meetingUrl: string; meetingId: string;
  scheduledAt: string | null; startedAt: string | null; endedAt: string | null;
  status: 'scheduled' | 'live' | 'ended'; duration: number; isActive: boolean;
}

export default function LiveClassesPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'scheduled' | 'live' | 'ended'>('all');
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [classesRes, batchesRes] = await Promise.all([
        fetch(`${API_URL}/api/live-classes`), fetch(`${API_URL}/api/batches`)
      ]);
      const classesData = await classesRes.json();
      const batchesData = await batchesRes.json();
      if (classesData.success) setLiveClasses(classesData.data);
      if (batchesData.success) setBatches(batchesData.data);
    } catch (error) { console.error('Error fetching data:', error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredClasses = liveClasses.filter((liveClass) => {
    if (activeFilter === 'all') return true;
    return liveClass.status === activeFilter;
  });

  const handleStartClass = async (liveClass: LiveClass) => {
    if (liveClass.status === 'scheduled') {
        try {
            await fetch(`${API_URL}/api/live-classes/${liveClass.id}/start`, { method: 'POST' });
            fetchData(); 
        } catch (error) { console.error('Failed to start class'); }
    }
    window.open(liveClass.meetingUrl, '_blank');
  };

  const handleEndClass = async (classId: string) => {
    if (!window.confirm("Are you sure you want to end this class for everyone?")) return;
    try {
        await fetch(`${API_URL}/api/live-classes/${classId}/end`, { method: 'POST' });
        fetchData(); 
    } catch (error) { console.error('Failed to end class'); }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm("Delete this live class?")) return;
    try {
        await fetch(`${API_URL}/api/live-classes/${classId}`, { method: 'DELETE' });
        fetchData();
    } catch (error) { console.error('Failed to delete class'); }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-orange-100 text-primary',
      live: 'bg-green-100 text-green-700 animate-pulse',
      ended: 'bg-gray-100 text-gray-700',
    };
    return styles[status as keyof typeof styles] || styles.scheduled;
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toTimeString() .split(' ')[0] + ' ' + date.toLocaleDateString();
  };

  return (
    <div className="p-8 bg-cream min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Live Classes</h1>
        <p className="text-gray-600 mt-1">Schedule and manage live classes with Jitsi integration</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 gap-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeFilter === 'all' ? 'bg-orange-50 text-primary' : 'text-gray-600 hover:bg-orange-50/50 hover:text-primary'}`}>All Classes</button>
              <button onClick={() => setActiveFilter('scheduled')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeFilter === 'scheduled' ? 'bg-orange-50 text-primary' : 'text-gray-600 hover:bg-orange-50/50 hover:text-primary'}`}>Scheduled</button>
              <button onClick={() => setActiveFilter('live')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeFilter === 'live' ? 'bg-orange-50 text-primary' : 'text-gray-600 hover:bg-orange-50/50 hover:text-primary'}`}>Live Now</button>
              <button onClick={() => setActiveFilter('ended')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeFilter === 'ended' ? 'bg-orange-50 text-primary' : 'text-gray-600 hover:bg-orange-50/50 hover:text-primary'}`}>Ended</button>
            </div>

            <button onClick={() => { setSelectedClass(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
              <Plus className="w-5 h-5" /> Schedule Live Class
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500 font-medium">Loading live classes...</div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No live classes found</p>
              <button onClick={() => setIsModalOpen(true)} className="mt-4 text-primary hover:opacity-80 font-bold">
                Schedule your first live class
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((liveClass) => (
                <div key={liveClass.id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-orange-200 transition-all relative bg-white">
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => { setSelectedClass(liveClass); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteClass(liveClass.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-start justify-between mb-4 mt-6">
                    <div className="flex-1 pr-2">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{liveClass.title}</h3>
                      <p className="text-sm font-medium text-gray-500 line-clamp-1">{liveClass.batch?.name || 'Unknown Batch'}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getStatusBadge(liveClass.status)}`}>
                      {liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{formatDateTime(liveClass.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{liveClass.duration} minutes</span>
                    </div>
                    {liveClass.status === 'live' && liveClass.startedAt && (
                      <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                        <Video className="w-4 h-4" />
                        <span>Started {formatDateTime(liveClass.startedAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    {liveClass.status === 'scheduled' && (
                      <button onClick={() => handleStartClass(liveClass)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors">
                        <Play className="w-4 h-4" /> Start & Join Class
                      </button>
                    )}
                    {liveClass.status === 'live' && (
                      <div className="space-y-2">
                        <button onClick={() => handleStartClass(liveClass)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                          <ExternalLink className="w-4 h-4" /> Join Class
                        </button>
                        <button onClick={() => handleEndClass(liveClass.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">
                          <Square className="w-4 h-4" /> End Class
                        </button>
                      </div>
                    )}
                    {liveClass.status === 'ended' && (
                      <div className="text-center text-sm font-medium text-gray-500 bg-gray-50 p-2 rounded-xl">
                        Ended {formatDateTime(liveClass.endedAt)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <LiveClassModal
          liveClass={selectedClass}
          batches={batches}
          onClose={() => { setIsModalOpen(false); setSelectedClass(null); }}
          onSave={() => { setIsModalOpen(false); setSelectedClass(null); fetchData(); }}
        />
      )}
    </div>
  );
}