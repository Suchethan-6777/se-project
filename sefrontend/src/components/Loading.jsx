import React from 'react';
import { useTheme } from '../utils/ThemeContext';

const Loading = ({ size = 'default' }) => {
  const { darkMode } = useTheme();
  
  const sizeClasses = {
    sm: 'h-6 w-6',
    default: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col justify-center items-center space-y-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 ${
            darkMode
              ? 'border-gray-700 border-t-primary-400 border-r-primary-400/50'
              : 'border-gray-100 border-t-primary-600 border-r-primary-600/50'
          } shadow-lg`}
        />
        <div className={`absolute inset-0 ${sizeClasses[size]} animate-pulse opacity-50 rounded-full 
          ${darkMode ? 'bg-primary-500/10' : 'bg-primary-500/5'}`} />
      </div>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Loading...
      </p>
    </div>
  );
};

export default Loading;