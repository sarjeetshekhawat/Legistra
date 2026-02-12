import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const ProtectedLayout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
