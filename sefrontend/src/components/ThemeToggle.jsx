import React from 'react';
import { useTheme } from '../utils/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
        darkMode
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300 hover:text-yellow-200 shadow-gray-900/50'
          : 'bg-white hover:bg-gray-100 text-primary-600 hover:text-primary-700 shadow-gray-200/50'
      } backdrop-blur-sm bg-opacity-90 hover:shadow-xl`}
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        {/* Sun icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-6 h-6 absolute inset-0 transform transition-all duration-500 ${
            darkMode 
              ? 'rotate-90 opacity-100 scale-100' 
              : '-rotate-90 opacity-0 scale-50'
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
        {/* Moon icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-6 h-6 absolute inset-0 transform transition-all duration-500 ${
            !darkMode 
              ? 'rotate-90 opacity-100 scale-100' 
              : '-rotate-90 opacity-0 scale-50'
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      </div>
    </button>
  );
};

export default ThemeToggle;