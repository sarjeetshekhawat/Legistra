import React from 'react';
import * as Icons from '@heroicons/react/24/outline';

const tabs = [
  { id: 'upload', label: 'Upload Documents', icon: Icons.ArrowUpTrayIcon },
  { id: 'analysis', label: 'Analysis Results', icon: Icons.DocumentTextIcon },
  { id: 'search', label: 'Search & Query', icon: Icons.MagnifyingGlassIcon },
  { id: 'visualizations', label: 'Visualizations', icon: Icons.ChartBarSquareIcon },
  { id: 'settings', label: 'Settings', icon: Icons.Cog6ToothIcon },
];

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen hidden md:block">
      <ul className="space-y-1 p-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <li key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;
