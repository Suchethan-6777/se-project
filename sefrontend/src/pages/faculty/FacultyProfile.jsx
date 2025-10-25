import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { authUtils, userUtils } from '../../utils/auth';
import { useTheme } from '../../utils/ThemeContext';

const BackButton = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  return (
    <button
      onClick={() => navigate(-1)}
      className={`mb-4 inline-flex items-center gap-2 text-sm font-medium ${
        darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
      } transition-colors duration-200`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Back
    </button>
  );
};

const FacultyProfile = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (error || !user) return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
      <h3 className="text-sm font-medium text-red-800">Error</h3>
      <p className="mt-2 text-sm text-red-700">{error || 'User details not found'}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton />
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Faculty Profile</h1>

      <div className={`${darkMode ? 'bg-gray-800 shadow-lg shadow-gray-900/50' : 'bg-white shadow-xl'} rounded-lg p-6 md:p-8 transition-colors duration-200`}>
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          <div className="relative group">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=2563eb&textColor=ffffff&size=128`}
              alt="Profile Avatar"
              className={`w-32 h-32 rounded-full border-4 ${darkMode ? 'border-primary-400 shadow-lg shadow-primary-500/20' : 'border-primary-500 shadow-sm'} transition-all duration-200 group-hover:scale-105`}
            />
          </div>

          <div className="w-full space-y-4">
            <div>
              <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</label>
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
            </div>
            <div>
              <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</label>
              <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.email}</p>
            </div>
            <div>
              <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</label>
              <p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-primary-900/50 text-primary-200' : 'bg-primary-100 text-primary-800'} capitalize transition-colors duration-200`}>
                  {user.role}
                </span>
              </p>
            </div>
            <div>
              <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>User ID</label>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{user.id}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Faculty Actions</h2>
          <p className="text-gray-600">This area can include quick links to create quizzes, view submissions, or manage question banks.</p>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
