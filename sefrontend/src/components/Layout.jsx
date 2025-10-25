import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../utils/ThemeContext';

const Layout = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-b ${darkMode 
      ? 'from-gray-900 to-gray-800 text-gray-100' 
      : 'from-gray-50 to-white text-gray-900'} transition-colors duration-200`}>
      <Navbar />
      {/*
        Add top padding so fixed navbar doesn't overlap page content.
        Navbar height is h-16 (4rem / 64px) so we give the main area
        a matching top padding. Use pt-20 to add a little extra breathing room.
      */}
      <main className="flex-1 pt-20 pb-6 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Outlet />
        </div>
        {/* Theme Toggle Button - Fixed Position */}
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeToggle className="shadow-lg hover:shadow-xl transition-shadow duration-200" />
        </div>
        {/* Decorative Elements */}
        <div className={`fixed inset-0 z-0 pointer-events-none ${darkMode 
          ? 'opacity-30' 
          : 'opacity-10'}`}>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </main>
    </div>
  );
};

export default Layout;

