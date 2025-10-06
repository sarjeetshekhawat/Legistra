import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Search from './pages/Search';
import Visualizations from './pages/Visualizations';
import Settings from './pages/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <Upload />;
      case 'analysis':
        return <Analysis />;
      case 'search':
        return <Search />;
      case 'visualizations':
        return <Visualizations />;
      case 'settings':
        return <Settings />;
      default:
        return <Upload />;
    }
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-legal-light">
          <Header />
          <div className="flex">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 p-6">
              {renderContent()}
            </main>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
