import { useState } from 'react';
import { Plus, Video, Calendar, Clock, Users, ExternalLink, Play, Square } from 'lucide-react';
import LiveClassModal from '../components/LiveClassModal';

interface LiveClass {
  id: string;
  batch_id: string;
  batch_name: string;
  title: string;
  meeting_url: string;
  meeting_id: string;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  status: 'scheduled' | 'live' | 'ended';
  duration: number;
  is_active: boolean;
}

const mockLiveClasses: LiveClass[] = [
  {
    id: '1',
    batch_id: '1',
    batch_name: 'Advanced JavaScript 2024',
    title: 'Live Class - ES6 Advanced Features',
    meeting_url: 'https://meet.jit.si/MantrikaBrahma_Advanced_JavaScript_2024_1234567890',
    meeting_id: 'MantrikaBrahma_Advanced_JavaScript_2024_1234567890',
    scheduled_at: '2024-03-01T10:00:00Z',
    started_at: null,
    ended_at: null,
    status: 'scheduled',
    duration: 90,
    is_active: true,
  },
  {
    id: '2',
    batch_id: '2',
    batch_name: 'React Masterclass',
    title: 'Live Class - React Hooks Deep Dive',
    meeting_url: 'https://meet.jit.si/MantrikaBrahma_React_Masterclass_1234567891',
    meeting_id: 'MantrikaBrahma_React_Masterclass_1234567891',
    scheduled_at: '2024-02-28T15:00:00Z',
    started_at: '2024-02-28T15:02:00Z',
    ended_at: null,
    status: 'live',
    duration: 120,
    is_active: true,
  },
  {
    id: '3',
    batch_id: '1',
    batch_name: 'Advanced JavaScript 2024',
    title: 'Live Class - Async Programming',
    meeting_url: 'https://meet.jit.si/MantrikaBrahma_Advanced_JavaScript_2024_1234567892',
    meeting_id: 'MantrikaBrahma_Advanced_JavaScript_2024_1234567892',
    scheduled_at: '2024-02-25T14:00:00Z',
    started_at: '2024-02-25T14:01:00Z',
    ended_at: '2024-02-25T15:35:00Z',
    status: 'ended',
    duration: 90,
    is_active: true,
  },
];

export default function LiveClassesPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'scheduled' | 'live' | 'ended'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);

  const filteredClasses = mockLiveClasses.filter((liveClass) => {
    if (activeFilter === 'all') return true;
    return liveClass.status === activeFilter;
  });

  const handleStartClass = (liveClass: LiveClass) => {
    window.open(liveClass.meeting_url, '_blank');
  };

  const handleEndClass = (classId: string) => {
    console.log('Ending class:', classId);
  };

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
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Classes
              </button>
              <button
                onClick={() => setActiveFilter('scheduled')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === 'scheduled'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Scheduled
              </button>
              <button
                onClick={() => setActiveFilter('live')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === 'live'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Live Now
              </button>
              <button
                onClick={() => setActiveFilter('ended')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === 'ended'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Ended
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedClass(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Schedule Live Class
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((liveClass) => (
              <div
                key={liveClass.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{liveClass.title}</h3>
                    <p className="text-sm text-gray-600">{liveClass.batch_name}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                      liveClass.status
                    )}`}
                  >
                    {liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateTime(liveClass.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{liveClass.duration} minutes</span>
                  </div>
                  {liveClass.status === 'live' && liveClass.started_at && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Video className="w-4 h-4" />
                      <span>Started {formatDateTime(liveClass.started_at)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  {liveClass.status === 'scheduled' && (
                    <button
                      onClick={() => handleStartClass(liveClass)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Start & Join Class
                    </button>
                  )}
                  {liveClass.status === 'live' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleStartClass(liveClass)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Join Class
                      </button>
                      <button
                        onClick={() => handleEndClass(liveClass.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Square className="w-4 h-4" />
                        End Class
                      </button>
                    </div>
                  )}
                  {liveClass.status === 'ended' && (
                    <div className="text-center text-sm text-gray-500">
                      Ended {formatDateTime(liveClass.ended_at)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No live classes found</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Schedule your first live class
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <LiveClassModal
          liveClass={selectedClass}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedClass(null);
          }}
          onSave={() => {
            setIsModalOpen(false);
            setSelectedClass(null);
          }}
        />
      )}
    </div>
  );
}
