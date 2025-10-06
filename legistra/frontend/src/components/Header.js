import React from 'react';
import { DocumentTextIcon, UserCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-legal-blue mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Legistra</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="btn-primary flex items-center">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export Report
            </button>

            <div className="flex items-center space-x-2">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-700">User</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
