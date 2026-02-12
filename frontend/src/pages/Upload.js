import React, { useState } from 'react';
import { uploadDocument } from '../services/api';
import Toast from '../components/Toast';

function Upload() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const allowedExtensions = ['txt', 'docx', 'pdf', 'doc'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    if (!file) return { valid: false, error: 'Please select a file to upload.' };
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
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error);
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    
    setError('');
    setUploadStatus('');
    setUploadProgress(0);
    
    const validation = validateFile(droppedFile);
    if (!validation.valid) {
      setError(validation.error);
      setFile(null);
      return;
    }
    setFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
        setToast({ message: '✓ Upload successful! Document is being processed.', type: 'success' });
        setFile(null);
        setUploadProgress(0);
        // Reset file input
        document.getElementById('file-input').value = '';
      } else {
        const errorMsg = response.data?.error || 'Upload failed. Please try again.';
        setError(errorMsg);
        setToast({ message: errorMsg, type: 'error' });
      }
    } catch (err) {
      // Extract error message from response
      let errorMsg = 'Upload failed. Please try again.';
      
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error request:', err.request);
      console.error('Error message:', err.message);
      
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const data = err.response.data;
        
        if (data && data.error) {
          errorMsg = data.error;
        } else if (status === 413) {
          errorMsg = 'File is too large. Maximum size is 10MB.';
        } else if (status === 400) {
          errorMsg = data?.error || 'Invalid file. Please check the file format and try again.';
        } else if (status === 500) {
          errorMsg = data?.error || 'Server error. Please try again later.';
        } else {
          errorMsg = `Upload failed (${status}). Please try again.`;
        }
      } else if (err.request) {
        // Request was made but no response received
        if (err.code === 'ECONNABORTED') {
          errorMsg = 'Request timed out. Please check your connection and try again.';
        } else if (err.message.includes('Network Error')) {
          errorMsg = 'Network error. Please check if the backend server is running on localhost:5000.';
        } else {
          errorMsg = 'No response from server. Please check your connection and ensure the backend is running.';
        }
      } else {
        // Error setting up request
        errorMsg = err.message || 'Failed to upload file. Please try again.';
      }
      
      setError(errorMsg);
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setError('');
    setUploadStatus('');
    document.getElementById('file-input').value = '';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Upload Legal Document</h1>
        <p className="text-gray-600">
          Upload your legal document for AI-powered analysis and clause extraction
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Document Upload</h2>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            Supported formats: PDF, DOCX, TXT (Max 10MB)
          </p>

          {/* File Input with Drag & Drop */}
          <div className="space-y-4">
            <div className="relative">
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                accept=".txt,.docx,.pdf,.doc"
                disabled={isUploading}
                className="sr-only"
              />
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                  ${isUploading ? 'cursor-not-allowed opacity-50' : ''}
                `}
                onClick={() => !isUploading && document.getElementById('file-input')?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="w-12 h-12 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">Uploading document...</p>
                  </div>
                ) : file ? (
                  <div className="space-y-4">
                    <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">PDF, DOCX, or TXT files</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Upload Progress</span>
                  <span className="text-gray-900 font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {uploadStatus && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{uploadStatus}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`
                  flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Document
                  </>
                )}
              </button>
              
              {file && !isUploading && (
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                1
              </div>
              <h4 className="font-medium text-gray-900">Upload Document</h4>
              <p className="text-gray-600">
                Upload your legal document in PDF, DOCX, or TXT format
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                2
              </div>
              <h4 className="font-medium text-gray-900">AI Analysis</h4>
              <p className="text-gray-600">
                Our AI analyzes the document and extracts key clauses
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                3
              </div>
              <h4 className="font-medium text-gray-900">Get Results</h4>
              <p className="text-gray-600">
                Review summary, clauses, risks, and export PDF report
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Upload;
