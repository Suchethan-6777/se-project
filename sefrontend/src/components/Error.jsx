import React from 'react';
import { useTheme } from '../utils/ThemeContext';

const Error = ({ message, onRetry }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`rounded-xl p-6 ${
      darkMode 
        ? 'bg-red-900/10 border border-red-700/30 shadow-lg shadow-red-900/10' 
        : 'bg-red-50 border border-red-200 shadow-lg shadow-red-500/10'
    } animate-fade-in transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5`}>
      <div className="flex items-center">
        <div className={`rounded-full p-3 ${
          darkMode 
            ? 'bg-gradient-to-br from-red-900/40 to-red-800/40 ring-1 ring-red-700/50' 
            : 'bg-gradient-to-br from-red-100 to-red-50 ring-1 ring-red-200'
        }`}>
          <svg
            className={`h-6 w-6 ${
              darkMode ? 'text-red-300' : 'text-red-600'
            } animate-pulse`}
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className={`text-base font-semibold ${
            darkMode ? 'text-red-300' : 'text-red-800'
          }`}>
            Error Occurred
          </h3>
          <p className={`mt-2 ${
            darkMode ? 'text-red-200/90' : 'text-red-700/90'
          }`}>
            {message}
          </p>
        </div>
      </div>
      {onRetry && (
        <div className="mt-6">
          <button
            onClick={onRetry}
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
              transition-all duration-300 transform hover:scale-105 ${
              darkMode
                ? 'bg-red-900/30 text-red-300 hover:bg-red-800/40 ring-1 ring-red-700/50'
                : 'bg-red-100 text-red-700 hover:bg-red-200 ring-1 ring-red-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Error;