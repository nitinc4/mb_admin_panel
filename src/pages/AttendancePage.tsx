import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function AttendancePage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  const [stats, setStats] = useState({ totalClasses: 0, averageAttendance: '0.00' });
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load Batches
  useEffect(() => {
    fetch(`${API_URL}/api/batches`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setBatches(data.data);
      });
  }, []);

  // Load Batch Stats and Classes when Batch selected
  useEffect(() => {
    if (!selectedBatchId) return;
    
    // Fetch overall stats
    fetch(`${API_URL}/api/attendance/batch/${selectedBatchId}/stats`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setStats(data.data);
      });

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

  // Load Students Attendance for Selected Class
  useEffect(() => {
    if (!selectedBatchId || !selectedClassId) return;
    setIsLoading(true);
    fetch(`${API_URL}/api/attendance/batch/${selectedBatchId}/class/${selectedClassId}/records`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setRecords(data.data);
      })
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
      // Trigger a re-fetch of overall batch stats to update averages
      fetch(`${API_URL}/api/attendance/batch/${selectedBatchId}/stats`)
        .then(r => r.json())
        .then(data => { if (data.success) setStats(data.data); });
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-2">1. Select Batch</label>
          <select 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
            value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}
          >
            <option value="">-- Choose a Batch --</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {selectedBatchId && (
            <div className="mt-4 flex gap-4 text-sm bg-orange-50 p-3 rounded-lg border border-orange-100">
              <div><span className="font-bold text-orange-900">Total Classes:</span> {stats.totalClasses}</div>
              <div><span className="font-bold text-orange-900">Avg Attendance:</span> {stats.averageAttendance}%</div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-2">2. Select Live Class</label>
          <select 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}
            disabled={!selectedBatchId || liveClasses.length === 0}
          >
            <option value="">-- Choose a Class --</option>
            {liveClasses.map(c => (
              <option key={c.id} value={c.id}>{c.title} ({new Date(c.scheduledAt).toLocaleDateString()})</option>
            ))}
          </select>
          {selectedBatchId && liveClasses.length === 0 && (
            <p className="text-xs text-red-500 mt-2">No live classes found for this batch.</p>
          )}
        </div>
      </div>

      {selectedClassId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-800">Class Roster & Attendance</h3></div>
          {isLoading ? (
             <div className="p-8 text-center text-gray-500">Loading records...</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-bold">Student Name</th>
                  <th className="px-6 py-3 font-bold">Email</th>
                  <th className="px-6 py-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-4 text-center">No students enrolled.</td></tr>
                ) : (
                  records.map(record => (
                    <tr key={record.userId} className="hover:bg-orange-50/20">
                      <td className="px-6 py-4 font-medium text-gray-900">{record.name}</td>
                      <td className="px-6 py-4">{record.email}</td>
                      <td className="px-6 py-4 text-right">
                        <select 
                          className={`px-3 py-1 rounded-full font-bold text-xs border-none focus:ring-2 outline-none ${
                            record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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