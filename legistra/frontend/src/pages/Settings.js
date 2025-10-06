import React, { useState } from 'react';

function Settings() {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.className = newTheme;
  };

  const handleNotificationsChange = (e) => {
    setNotifications(e.target.checked);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={() => handleThemeChange('light')}
              />
              Light
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => handleThemeChange('dark')}
              />
              Dark
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            <input
              type="checkbox"
              checked={notifications}
              onChange={handleNotificationsChange}
            />
            Enable notifications
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <select value={language} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Settings;
