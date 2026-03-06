import { useState, useEffect } from 'react';
import { Cloud, FileText, Film, HardDrive, ExternalLink, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { API_URL } from '../config';

interface S3File {
  key: string;
  size: number;
  lastModified: string;
  url: string;
}

// Pricing Constants
const FREE_TIER_GB = 5;
const FREE_TIER_BYTES = FREE_TIER_GB * 1024 * 1024 * 1024;
const PRICE_PER_GB_USD = 0.025;
const USD_TO_INR = 83.5; // Approximate exchange rate

export default function DrivePage() {
  const [files, setFiles] = useState<S3File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/drive`);
      const data = await res.json();
      if (data.success) {
        setFiles(data.files);
      } else {
        setError(data.message || 'Failed to fetch files');
      }
    } catch (err) {
      setError('A network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (key: string) => {
    // Serious warning to prevent breaking active courses
    const confirmed = window.confirm(
      '⚠️ WARNING: Are you sure you want to permanently delete this file?\n\n' +
      'If this file is currently attached to a live Batch, deleting it here will BREAK the video/PDF for your students! ' +
      'Only delete files here if you are sure they are orphaned/unused.'
    );

    if (!confirmed) return;

    setDeletingKey(key);
    setError(null);

    try {
      // Send the delete request with the exact S3 key
      const res = await fetch(`${API_URL}/api/drive?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        // Remove the file from the local state immediately
        setFiles((prev) => prev.filter((file) => file.key !== key));
      } else {
        setError(data.message || 'Failed to delete file');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('A network error occurred while deleting the file.');
    } finally {
      setDeletingKey(null);
    }
  };

  // Calculations
  const totalSizeBytes = files.reduce((acc, file) => acc + file.size, 0);
  const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024);
  
  // Cost calculation
  const billableGB = Math.max(0, totalSizeGB - FREE_TIER_GB);
  const estimatedCostUSD = billableGB * PRICE_PER_GB_USD;
  const estimatedCostINR = estimatedCostUSD * USD_TO_INR;

  // Progress Bar percentage
  const usagePercentage = Math.min(100, (totalSizeBytes / FREE_TIER_BYTES) * 100);
  const isOverLimit = totalSizeBytes > FREE_TIER_BYTES;

  // Formatting helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8 bg-cream min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Cloud className="w-8 h-8 text-blue-500" /> S3 Cloud Drive
        </h1>
        <p className="text-gray-600 mt-1">Manage your raw media files stored in Amazon S3</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* --- COST & USAGE DASHBOARD --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-gray-500" /> Storage Usage
            </h2>
            <p className="text-sm text-gray-500">
              {formatBytes(totalSizeBytes)} used of {FREE_TIER_GB}GB Free Tier
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Estimated Cost / Month</p>
            <p className={`text-2xl font-bold ${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
              ₹{estimatedCostINR.toFixed(2)} <span className="text-sm font-medium text-gray-500">INR</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden border border-gray-200">
          <div 
            className={`h-4 rounded-full transition-all duration-1000 ${isOverLimit ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs font-medium">
          <span className="text-gray-500">0 GB</span>
          {isOverLimit && <span className="text-red-500 font-bold">Over Limit! ({totalSizeGB.toFixed(2)} GB)</span>}
          <span className="text-gray-500">5 GB (Free Limit)</span>
        </div>
      </div>

      {/* --- FILE LIST --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-700">All Files ({files.length})</h3>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading files from AWS S3...</div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center text-gray-500 italic">Your S3 bucket is currently empty.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">File Name</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date Uploaded</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {files.map((file) => {
                  const isVideo = file.key.match(/\.(mp4|mov|avi)$/i);
                  const isDeletingThis = deletingKey === file.key;

                  return (
                    <tr key={file.key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isVideo ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {isVideo ? <Film className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <span className="font-medium text-gray-800 break-all">{file.key.replace('media/', '')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(file.lastModified).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">
                        {formatBytes(file.size)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                          
                          <button
                            onClick={() => handleDelete(file.key)}
                            disabled={isDeletingThis || deletingKey !== null}
                            className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors ${
                              isDeletingThis 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                            }`}
                            title="Permanently delete file"
                          >
                            {isDeletingThis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}