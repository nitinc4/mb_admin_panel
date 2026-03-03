import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function AttendancePage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  const [globalStats, setGlobalStats] = useState({ totalClasses: 0, totalPresent: 0, averageAttendance: '0.00' });
  const [batchStats, setBatchStats] = useState({ totalClasses: 0, averageAttendance: '0.00' });
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load Batches and Global Stats on mount
  useEffect(() => {
    fetch(`${API_URL}/api/batches`)
      .then(r => r.json())
      .then(data => { if (data.success) setBatches(data.data); });
      
    fetch(`${API_URL}/api/attendance/stats`)
      .then(r => r.json())
      .then(data => { if (data.success) setGlobalStats(data.data); });
  }, []);

  // Load Batch Stats and Classes when a Batch is selected
  useEffect(() => {
    if (!selectedBatchId) {
        setBatchStats({ totalClasses: 0, averageAttendance: '0.00' });
        setLiveClasses([]);
        setSelectedClassId('');
        setRecords([]);
        return;
    }
    
    // Fetch overall stats for this batch
    fetch(`${API_URL}/api/attendance/batch/${selectedBatchId}/stats`)
      .then(r => r.json())
      .then(data => { if (data.success) setBatchStats(data.data); });

    // Fetch classes for dropdown
    fetch(`${API_URL}/api/live-classes`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const batchClasses = data.data.filter((c: any) => 
            (c.batch._id || c.batch.id || c.batch) === selectedBatchId
          );
          setLiveClasses(batchClasses);
          setSelectedClassId('');
          setRecords([]);
        }
      });
  }, [selectedBatchId]);

  // Load Student Attendance Records for Selected Class
  useEffect(() => {
    if (!selectedBatchId || !selectedClassId) return;
    setIsLoading(true);
    fetch(`${API_URL}/api/attendance/batch/${selectedBatchId}/class/${selectedClassId}/records`)
      .then(r => r.json())
      .then(data => { if (data.success) setRecords(data.data); })
      .finally(() => setIsLoading(false));
  }, [selectedClassId]);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    // Update locally first for fast UI
    setRecords(records.map(r => r.userId === userId ? { ...r, status: newStatus } : r));

    try {
      await fetch(`${API_URL}/api/attendance/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, liveClassId: selectedClassId, batchId: selectedBatchId, status: newStatus })
      });
      // Trigger a re-fetch of overall batch and global stats to update averages
      fetch(`${API_URL}/api/attendance/batch/${selectedBatchId}/stats`)
        .then(r => r.json())
        .then(data => { if (data.success) setBatchStats(data.data); });
      fetch(`${API_URL}/api/attendance/stats`)
        .then(r => r.json())
        .then(data => { if (data.success) setGlobalStats(data.data); });
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  return (
    <div className="p-8 bg-cream min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Unified Attendance System</h1>
        <p className="text-gray-600 mt-1">Manage and track student live class attendance</p>
      </div>

      {/* --- TOP SECTION: GLOBAL STATS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row justify-around items-center">
        <div className="text-center mb-4 md:mb-0">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Classes Conducted</p>
          <p className="text-4xl font-bold text-primary mt-1">{globalStats.totalClasses}</p>
        </div>
        <div className="hidden md:block w-px h-16 bg-gray-200"></div>
        <div className="text-center mb-4 md:mb-0">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Attendances</p>
          <p className="text-4xl font-bold text-green-600 mt-1">{globalStats.totalPresent}</p>
        </div>
        <div className="hidden md:block w-px h-16 bg-gray-200"></div>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Global Average Attendance</p>
          <p className="text-4xl font-bold text-orange-500 mt-1">{globalStats.averageAttendance}%</p>
        </div>
      </div>

      {/* --- MIDDLE SECTION: SELECTORS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-2">1. Select Batch</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}
          >
            <option value="">-- Choose a Batch --</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {selectedBatchId && (
            <div className="mt-4 flex gap-4 text-sm bg-orange-50 p-3 rounded-lg border border-orange-100">
              <div><span className="font-bold text-orange-900">Classes in Batch:</span> {batchStats.totalClasses}</div>
              <div><span className="font-bold text-orange-900">Avg Attendance:</span> {batchStats.averageAttendance}%</div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-2">2. Select Live Class</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100 disabled:text-gray-400"
            value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}
            disabled={!selectedBatchId || liveClasses.length === 0}
          >
            <option value="">-- Choose a Class --</option>
            {liveClasses.map(c => (
              <option key={c.id} value={c.id}>{c.title} ({new Date(c.scheduledAt).toLocaleDateString()})</option>
            ))}
          </select>
          {selectedBatchId && liveClasses.length === 0 && (
            <p className="text-xs text-red-500 font-medium mt-2">No live classes found for this batch.</p>
          )}
        </div>
      </div>

      {/* --- BOTTOM SECTION: CLASS ROSTER TABLE --- */}
      {selectedClassId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
             <h3 className="font-bold text-gray-800">Class Roster & Attendance</h3>
          </div>
          {isLoading ? (
             <div className="p-12 text-center text-gray-500 font-medium">Loading student records...</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold text-gray-700">Student Name</th>
                  <th className="px-6 py-3 font-bold text-gray-700">Email</th>
                  <th className="px-6 py-3 font-bold text-gray-700 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">No students found enrolled in this batch.</td></tr>
                ) : (
                  records.map(record => (
                    <tr key={record.userId} className="hover:bg-orange-50/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{record.name}</td>
                      <td className="px-6 py-4 text-gray-500">{record.email}</td>
                      <td className="px-6 py-4 text-right">
                        <select 
                          className={`px-3 py-1.5 rounded-full font-bold text-xs border-none focus:ring-2 outline-none cursor-pointer transition-colors ${
                            record.status === 'present' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                          value={record.status}
                          onChange={(e) => handleStatusChange(record.userId, e.target.value)}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}