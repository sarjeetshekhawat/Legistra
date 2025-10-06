import axios from 'axios';

// Upload a single document
export function uploadDocument(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post('/api/upload-document', formData, {
    headers: {'Content-Type': 'multipart/form-data'},
    onUploadProgress: e => onProgress(Math.round((e.loaded * 100)/e.total))
  });
}

// Trigger analysis for a document by ID
export function analyzeDocument(documentId) {
  return axios.post('/api/analyze-document', { document_id: documentId });
}

// Get task status
export function getTaskStatus(taskId) {
  return axios.get(`/api/task-status/${taskId}`);
}

// Search documents
export function searchDocuments(query, filters = {}) {
  return axios.post('/api/search-documents', { query, filters });
}

// Get documents list
export function getDocuments(page = 1, perPage = 10, sortBy = 'upload_time', order = 'desc') {
  return axios.get('/api/documents', { params: { page, per_page: perPage, sort_by: sortBy, order } });
}

// Get dashboard stats
export function getDashboardStats() {
  return axios.get('/api/dashboard-stats');
}

// Export analysis
export function exportAnalysis(documentId) {
  return axios.post('/api/export-analysis', { document_id: documentId }, { responseType: 'blob' });
}
