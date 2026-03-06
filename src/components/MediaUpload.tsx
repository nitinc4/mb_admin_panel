import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const MediaUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setUploadedUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError(null);

    // 1. Prepare the form data. The key 'file' must match what Multer expects in the backend.
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 2. Send the request to your Express server
      // Note: Adjust the URL if your backend runs on a different port or you use a Vite proxy
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUploadedUrl(data.url);
        setFile(null); // Clear the file input on success
      } else {
        setError(data.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('A network error occurred while uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Media to S3</h3>

      {/* Upload Area */}
      <div className="flex flex-col items-center justify-center w-full mb-4">
        <label
          htmlFor="dropzone-file"
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
            file ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-300'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className={`w-8 h-8 mb-3 ${file ? 'text-indigo-500' : 'text-gray-400'}`} />
            {file ? (
              <p className="mb-2 text-sm text-indigo-600 font-medium truncate px-4 text-center max-w-full">
                {file.name}
              </p>
            ) : (
              <>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, MP4, or PDF (Max 10MB)</p>
              </>
            )}
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
            accept="image/*,video/*,application/pdf"
          />
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-md mb-4 text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Success Message & Image Preview */}
      {uploadedUrl && (
        <div className="mb-4">
          <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-md mb-3 text-sm">
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            Upload successful!
          </div>
          <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-2 flex justify-center">
            {uploadedUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
              <img src={uploadedUrl} alt="Uploaded preview" className="max-h-48 object-contain rounded" />
            ) : (
              <a href={uploadedUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-sm break-all">
                {uploadedUrl}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {file && (
          <button
            onClick={clearSelection}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-200"
          >
            Clear
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg focus:ring-4 focus:outline-none ${
            !file || isUploading
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload File'
          )}
        </button>
      </div>
    </div>
  );
};

export default MediaUpload;