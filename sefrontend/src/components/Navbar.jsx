import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../utils/ThemeContext";
import { authUtils, userUtils } from "../utils/auth";

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    // centralized logout clears token and user and redirects
    authUtils.logout();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg fixed w-full z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Title */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <div className="h-10 w-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                Quiz System
              </span>
            </Link>
          </div>

          {/* Right side navigation items */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle button */}
            <button
              onClick={toggleDarkMode}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Login/Profile button */}
            {token ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                >
                  <div className="h-8 w-8 rounded-full bg-primary-600/10 dark:bg-primary-700/20 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold">
                    {(() => {
                      const user = userUtils.getUser();
                      if (!user || !user.name) return 'U';
                      return user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
                    })()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{authUtils.getUserDisplayName()}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{userUtils.getUserRole() || 'User'}</span>
                  </div>
                </button>

                {isMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      {userUtils.getUserRole() === 'Faculty' ? (
                        <>
                          <Link
                            to="/faculty/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Creator Dashboard
                          </Link>
                          <Link
                            to="/faculty/analytics"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Analytics
                          </Link>
                          <Link
                            to="/faculty/my-assignments"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            My Assignments
                          </Link>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        </>
                      ) : (
                        <Link
                          to={(() => {
                            const role = userUtils.getUserRole();
                            if (role === 'Student') return '/student/dashboard';
                            if (role === 'Admin') return '/admin/dashboard';
                            return '/dashboard';
                          })()}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <Link
                        to={(() => {
                          const role = userUtils.getUserRole();
                          if (role === 'Student') return '/student/profile';
                          if (role === 'Faculty') return '/faculty/profile';
                          if (role === 'Admin') return '/admin/profile';
                          return '/profile';
                        })()}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;