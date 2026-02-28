import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Search from './pages/Search';
import Visualizations from './pages/Visualizations';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';
import OnboardingTour from './components/OnboardingTour';

function AppContent() {
  const [activeTab, setActiveTab] = useState('upload');
  const location = useLocation();

  // Initialize theme on app startup - default to dark
  useEffect(() => {
    const savedSettings = localStorage.getItem('legistra_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } else {
      // Default to dark theme for new users
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Update activeTab + page title based on current route
  useEffect(() => {
    const path = location.pathname;
    const titles = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/upload': 'Upload',
      '/analysis': 'Analysis',
      '/search': 'Search',
      '/visualizations': 'Visualizations',
      '/settings': 'Settings',
      '/landing': 'Legistra — AI Legal Document Analysis',
      '/login': 'Sign In',
      '/register': 'Sign Up',
    };
    const title = titles[path];
    document.title = title
      ? (path === '/landing' ? title : `${title} | Legistra`)
      : 'Legistra';

    if (path === '/' || path === '/upload') setActiveTab('upload');
    else if (path === '/analysis') setActiveTab('analysis');
    else if (path === '/search') setActiveTab('search');
    else if (path === '/visualizations') setActiveTab('visualizations');
    else if (path === '/settings') setActiveTab('settings');
  }, [location.pathname]);

  const renderContent = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') {
      return <Dashboard />;
    } else if (path === '/upload') {
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
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<Landing />} />
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
        
        {/* Redirect any unknown routes to landing */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
      
      {/* Onboarding Tour */}
      <OnboardingTour />
    </>
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
