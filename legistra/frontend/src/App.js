import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Search from './pages/Search';
import Visualizations from './pages/Visualizations';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';

function AppContent() {
  const [activeTab, setActiveTab] = useState('upload');
  const location = useLocation();

  // Initialize theme on app startup
  useEffect(() => {
    const savedSettings = localStorage.getItem('legistra_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Update activeTab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveTab('upload');
    } else if (path === '/upload') {
      setActiveTab('upload');
    } else if (path === '/analysis') {
      setActiveTab('analysis');
    } else if (path === '/search') {
      setActiveTab('search');
    } else if (path === '/visualizations') {
      setActiveTab('visualizations');
    } else if (path === '/settings') {
      setActiveTab('settings');
    }
  }, [location.pathname]);

  const renderContent = () => {
    const path = location.pathname;
    if (path === '/' || path === '/upload') {
      return <Upload />;
    } else if (path === '/analysis') {
      return <Analysis />;
    } else if (path === '/search') {
      return <Search />;
    } else if (path === '/visualizations') {
      return <Visualizations />;
    } else if (path === '/settings') {
      return <Settings />;
    }
    return <Upload />; // Default to upload
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <ProtectedLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/upload" element={
        <ProtectedRoute>
          <ProtectedLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Upload />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analysis" element={
        <ProtectedRoute>
          <ProtectedLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Analysis />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/search" element={
        <ProtectedRoute>
          <ProtectedLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Search />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/visualizations" element={
        <ProtectedRoute>
          <ProtectedLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Visualizations />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <ProtectedLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Settings />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      {/* Redirect any unknown routes to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <AppContent />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
