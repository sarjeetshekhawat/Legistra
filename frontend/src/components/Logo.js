import React from 'react';
import logoImage from '../assets/logo/logoo.jpg';

const Logo = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700`}>
      <img 
        src={logoImage}
        alt="Legistra Logo"
        className="w-full h-full object-cover"
        style={{ 
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
    </div>
  );
};

export default Logo;
