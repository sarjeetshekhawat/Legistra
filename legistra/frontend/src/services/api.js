import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('legistra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth data and redirect to login
      localStorage.removeItem('legistra_token');
      localStorage.removeItem('legistra_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Upload a single document
export function uploadDocument(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/upload-document', formData, {
    headers: {'Content-Type': 'multipart/form-data'},
    onUploadProgress: e => onProgress(Math.round((e.loaded * 100)/e.total))
  });
}

// Trigger analysis for a document by ID
export function analyzeDocument(documentId) {
  return api.post('/api/analyze-document-temp', { document_id: documentId });
}

// Get task status
export function getTaskStatus(taskId) {
  return api.get(`/api/task-status-temp/${taskId}`);
}

// Search documents
export function searchDocuments(query, filters = {}) {
  return api.post('/api/search-documents', { query, filters });
}

// Get documents list
export function getDocuments(page = 1, perPage = 10, sortBy = 'upload_time', order = 'desc') {
  return api.get('/api/documents', { params: { page, per_page: perPage, sort_by: sortBy, order } });
}

// Get dashboard stats
export function getDashboardStats() {
  return api.get('/api/dashboard-stats');
}

// Export analysis
export function exportAnalysis(documentId) {
  return api.post(`/api/export-analysis-temp/${documentId}`, {}, { responseType: 'blob' });
}

// Multilingual document analysis
export function analyzeDocumentMultilingual(documentId) {
  return api.post('/api/analyze-document-multilingual', { document_id: documentId }, {
    timeout: 60000  // Increased timeout to 60 seconds
  });
}

// Fast multilingual document analysis
export function analyzeDocumentFastMultilingual(documentId) {
  return api.post('/api/analyze-document-fast-multilingual', { document_id: documentId }, {
    timeout: 30000  // 30 second timeout for fast analysis
  });
}
