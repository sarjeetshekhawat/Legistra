import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function Settings() {
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [autoAnalysis, setAutoAnalysis] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [emailAlerts, setEmailAlerts] = useState(false);
  const { t, changeLanguage } = useLanguage();

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('legistra_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setTheme(settings.theme || 'light');
      setNotifications(settings.notifications !== undefined ? settings.notifications : true);
      setLanguage(settings.language || 'en');
      setAutoAnalysis(settings.autoAnalysis || false);
      setExportFormat(settings.exportFormat || 'pdf');
      setEmailAlerts(settings.emailAlerts || false);
      
      // Apply the saved theme
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNotificationsChange = (e) => {
    setNotifications(e.target.checked);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    changeLanguage(newLanguage);
  };

  const handleAutoAnalysisChange = (e) => {
    setAutoAnalysis(e.target.checked);
  };

  const handleExportFormatChange = (e) => {
    setExportFormat(e.target.value);
  };

  const handleEmailAlertsChange = (e) => {
    setEmailAlerts(e.target.checked);
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage or API
    localStorage.setItem('legistra_settings', JSON.stringify({
      theme,
      notifications,
      language,
      autoAnalysis,
      exportFormat,
      emailAlerts
    }));
    
    // Show success message
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('settingsDescription')}
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('generalSettings')}</h2>
          </div>
          
          <div className="space-y-6">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('theme')}</label>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === 'light'}
                    onChange={() => handleThemeChange('light')}
                    className="sr-only"
                  />
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${
                    theme === 'light' ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      theme === 'light' ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{t('light')}</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === 'dark'}
                    onChange={() => handleThemeChange('dark')}
                    className="sr-only"
                  />
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{t('dark')}</span>
                </label>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('language')}</label>
              <select 
                value={language} 
                onChange={handleLanguageChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('desktopNotifications')}</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('notificationsDescription')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={handleNotificationsChange}
                  className="sr-only"
                />
                <div className={`relative w-11 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Settings */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis Settings</h2>
          </div>
          
          <div className="space-y-6">
            {/* Auto Analysis */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Analysis</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Automatically analyze uploaded documents</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAnalysis}
                  onChange={handleAutoAnalysisChange}
                  className="sr-only"
                />
                <div className={`relative w-11 h-6 rounded-full transition-colors ${
                  autoAnalysis ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    autoAnalysis ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </label>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Export Format</label>
              <select 
                value={exportFormat} 
                onChange={handleExportFormatChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:text-white"
              >
                <option value="pdf">PDF</option>
                <option value="docx">Word Document</option>
                <option value="txt">Plain Text</option>
                <option value="json">JSON</option>
              </select>
            </div>

            {/* Email Alerts */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Alerts</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive analysis results via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={handleEmailAlertsChange}
                  className="sr-only"
                />
                <div className={`relative w-11 h-6 rounded-full transition-colors ${
                  emailAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    emailAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-t border-gray-200 dark:border-dark-border pt-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">user@example.com</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">Change</button>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last changed 30 days ago</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">Update</button>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">API Key</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">•••••••••••••••••••••</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">Regenerate</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t('saveSettings')}
        </button>
      </div>
    </div>
  );
}

export default Settings;
