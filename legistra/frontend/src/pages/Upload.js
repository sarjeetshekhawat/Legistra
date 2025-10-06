import React, { useState } from 'react';
import { uploadDocument } from '../services/api';

function Upload() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const allowedExtensions = ['txt', 'docx', 'pdf', 'doc'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    if (!file) return { valid: false, error: 'No file selected.' };
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return { valid: false, error: `Invalid file type. Allowed types: ${allowedExtensions.join(', ').toUpperCase()}.` };
    }
    if (file.size > maxFileSize) {
      return { valid: false, error: `File too large. Maximum size: ${maxFileSize / (1024 * 1024)}MB.` };
    }
    return { valid: true };
  };

  const handleFileChange = (e) => {
    setError('');
    setUploadStatus('');
    setUploadProgress(0);
    const selectedFile = e.target.files[0];
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error);
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setUploadStatus('');
    setError('');
    setIsUploading(true);
    try {
      const response = await uploadDocument(file, (progress) => {
        setUploadProgress(progress);
      });
      if (response.status === 200) {
        setUploadStatus('Upload successful! Document is being processed.');
        setFile(null);
        setUploadProgress(0);
        // Reset file input
        document.getElementById('file-input').value = '';
      } else {
        const errorMsg = response.data?.error || 'Upload failed. Please try again.';
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Upload failed. Please check your connection and try again.';
      setError(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Document</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
              Select Document
            </label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              accept=".txt,.docx,.pdf,.doc"
              className="input-field"
              disabled={isUploading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: TXT, DOCX, PDF, DOC (Max 10MB)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`btn-primary w-full ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>

          {uploadStatus && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800">{uploadStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Upload;
