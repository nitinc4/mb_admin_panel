import { useState, useEffect } from 'react';
import { Plus, Video, Calendar, Clock, ExternalLink, Play, Square, Edit, Trash2 } from 'lucide-react';
import LiveClassModal from '../components/LiveClassModal';

interface Batch {
  id: string;
  name: string;
}

interface LiveClass {
  id: string;
  batch: Batch; // Populated by Mongoose
  title: string;
  meetingUrl: string;
  meetingId: string;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  status: 'scheduled' | 'live' | 'ended';
  duration: number;
  isActive: boolean;
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
        fetch('http://localhost:3001/api/live-classes'),
        fetch('http://localhost:3001/api/batches')
      ]);
      
      const classesData = await classesRes.json();
      const batchesData = await batchesRes.json();
      
      if (classesData.success) setLiveClasses(classesData.data);
      if (batchesData.success) setBatches(batchesData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredClasses = liveClasses.filter((liveClass) => {
    if (activeFilter === 'all') return true;
    return liveClass.status === activeFilter;
  });

  const handleStartClass = async (liveClass: LiveClass) => {
    if (liveClass.status === 'scheduled') {
        try {
            await fetch(`http://localhost:3001/api/live-classes/${liveClass.id}/start`, { method: 'POST' });
            fetchData(); // Refresh to show it as 'live'
        } catch (error) {
            console.error('Failed to start class');
        }
    }
    window.open(liveClass.meetingUrl, '_blank');
  };

  const handleEndClass = async (classId: string) => {
    if (!window.confirm("Are you sure you want to end this class for everyone?")) return;
    try {
        await fetch(`http://localhost:3001/api/live-classes/${classId}/end`, { method: 'POST' });
        fetchData(); // Refresh to show it as 'ended'
    } catch (error) {
        console.error('Failed to end class');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm("Delete this live class?")) return;
    try {
        await fetch(`http://localhost:3001/api/live-classes/${classId}`, { method: 'DELETE' });
        fetchData();
    } catch (error) {
        console.error('Failed to delete class');
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      live: 'bg-green-100 text-green-800 animate-pulse',
      ended: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.scheduled;
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Live Classes</h1>
        <p className="text-gray-600 mt-1">Schedule and manage live classes with Jitsi integration</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex gap-2">
              <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeFilter === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>All Classes</button>
              <button onClick={() => setActiveFilter('scheduled')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeFilter === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>Scheduled</button>
              <button onClick={() => setActiveFilter('live')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeFilter === 'live' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>Live Now</button>
              <button onClick={() => setActiveFilter('ended')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeFilter === 'ended' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>Ended</button>
            </div>

            <button onClick={() => { setSelectedClass(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" /> Schedule Live Class
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading live classes...</div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No live classes found</p>
              <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 hover:text-blue-700 font-medium">
                Schedule your first live class
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((liveClass) => (
                <div key={liveClass.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative">
                  
                  {/* EDIT / DELETE ICONS */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => { setSelectedClass(liveClass); setIsModalOpen(true); }} className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteClass(liveClass.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-start justify-between mb-4 mt-6">
                    <div className="flex-1 pr-2">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{liveClass.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{liveClass.batch?.name || 'Unknown Batch'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusBadge(liveClass.status)}`}>
                      {liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateTime(liveClass.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{liveClass.duration} minutes</span>
                    </div>
                    {liveClass.status === 'live' && liveClass.startedAt && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Video className="w-4 h-4" />
                        <span>Started {formatDateTime(liveClass.startedAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    {liveClass.status === 'scheduled' && (
                      <button onClick={() => handleStartClass(liveClass)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Play className="w-4 h-4" /> Start & Join Class
                      </button>
                    )}
                    {liveClass.status === 'live' && (
                      <div className="space-y-2">
                        <button onClick={() => handleStartClass(liveClass)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <ExternalLink className="w-4 h-4" /> Join Class
                        </button>
                        <button onClick={() => handleEndClass(liveClass.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          <Square className="w-4 h-4" /> End Class
                        </button>
                      </div>
                    )}
                    {liveClass.status === 'ended' && (
                      <div className="text-center text-sm text-gray-500">
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