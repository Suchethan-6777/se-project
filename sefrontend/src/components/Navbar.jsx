import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../utils/ThemeContext";
import { authUtils, userUtils } from "../utils/auth";

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(authUtils.isAuthenticated());
  const [userInitials, setUserInitials] = useState('U'); // State for initials
  const [userName, setUserName] = useState(''); // State for user name
  const [userRole, setUserRole] = useState(''); // State for user role

  // Effect to update auth status and user details
  useEffect(() => {
    const updateAuthState = () => {
      // console.log("Navbar: updateAuthState triggered"); // Log update trigger
      const authStatus = authUtils.isAuthenticated();
      setIsAuthenticated(authStatus);
      if (authStatus) {
        const user = userUtils.getUser();
        const currentRole = user?.role || 'User'; // Get current role
        // console.log("Navbar: User data from storage:", user); // Log user data
        setUserName(user?.name || 'User');
        setUserRole(currentRole); // Set role state
        // console.log("Navbar: Setting userRole state to:", currentRole); // Log state set

        if (user?.name) {
          const initials = user.name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
          setUserInitials(initials || 'U');
        } else {
          setUserInitials('U');
        }
      } else {
        // Clear user details if not authenticated
        setUserName('');
        setUserRole(''); // Clear role state on logout
        setUserInitials('U');
        // console.log("Navbar: Clearing user state (logged out)");
      }
    };

    updateAuthState(); // Initial check
    window.addEventListener('authChange', updateAuthState);
    // Fallback interval check (can be adjusted or removed if event listener is reliable)
    const intervalId = setInterval(updateAuthState, 2000); // Check every 2 seconds

    return () => {
      window.removeEventListener('authChange', updateAuthState);
      clearInterval(intervalId);
    };
  }, []); // Run once on mount and rely on event/interval

  const handleLogout = () => {
    authUtils.logout();
    setIsMenuOpen(false);
    // Trigger state update immediately
    setIsAuthenticated(false);
    setUserName('');
    setUserRole('');
    setUserInitials('U');
    window.dispatchEvent(new Event('authChange')); // Dispatch event for other components
    navigate('/login'); // Redirect to login after logout
  };

  // Use the userRole STATE variable
  const getProfileLink = () => {
    // console.log(`Navbar: getProfileLink called with userRole state: '${userRole}'`);
    if (userRole === 'Student') return '/student/profile';
    if (userRole === 'Faculty') return '/faculty/profile';
    if (userRole === 'Admin') return '/admin/profile';
    // console.log("Navbar: getProfileLink returning fallback '/profile'");
    return '/profile'; // Fallback
  };

  const getDashboardLink = () => {
    // console.log(`Navbar: getDashboardLink called with userRole state: '${userRole}'`);
    if (userRole === 'Student') return '/student/dashboard';
    if (userRole === 'Faculty') return '/faculty/dashboard';
    if (userRole === 'Admin') return '/admin/dashboard';
    // console.log("Navbar: getDashboardLink returning fallback '/dashboard'");
    return '/dashboard'; // Fallback
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
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                // Sun Icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                // Moon Icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Login/Profile button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                >
                  {/* Avatar */}
                  <div className="h-8 w-8 rounded-full bg-primary-600/10 dark:bg-primary-700/20 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
                    {userInitials}
                  </div>
                  {/* Name/Role */}
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{userName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">

                      {/* 1. Common Dashboard Link */}
                      <Link
                        to={getDashboardLink()} // Uses helper which reads state
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>

                      {/* --- 2. Role-Specific Links --- */}

                      {/* Student Specific */}
                      {userRole === 'Student' && (
                        <Link
                          to="/student/my-attempts" // Correct link
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Attempts
                        </Link>
                      )}

                      {/* Faculty Specific */}
                      {userRole === 'Faculty' && (
                        <>
                          <Link
                            to="/faculty/my-quizzes" // Link to My Quizzes page
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                            onClick={() => setIsMenuOpen(false)}
                          >
                             My Quizzes
                           </Link>
                          <Link
                            to="/faculty/questions" // Link to Question Bank
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                            onClick={() => setIsMenuOpen(false)}
                          >
                             Question Bank
                           </Link>
                           {/* Add Analytics link back if desired */}
                           {/*
                           <Link
                             to="/faculty/analytics"
                             className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                             role="menuitem"
                             onClick={() => setIsMenuOpen(false)}
                           >
                              Analytics
                            </Link>
                           */}
                         </>
                      )}

                      {/* Admin Specific (Example) */}
                      {userRole === 'Admin' && (
                        <>
                           <Link
                             to="/admin/users" // Example Admin link
                             className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                             role="menuitem"
                             onClick={() => setIsMenuOpen(false)}
                           >
                             User Management
                           </Link>
                            <Link
                             to="/admin/all-quizzes" // Example Admin link
                             className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                             role="menuitem"
                             onClick={() => setIsMenuOpen(false)}
                           >
                             All Quizzes
                           </Link>
                           {/* Add Question Bank link for Admin too? */}
                           {/*
                           <Link to="/admin/questions" ... >Question Bank</Link>
                           */}
                        </>
                      )}
                      {/* --- End Role-Specific Links --- */}


                      {/* 3. Common Profile Link */}
                      <Link
                        to={getProfileLink()} // Uses helper which reads state
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                      {/* 4. Common Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Login Button
              <Link to="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
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