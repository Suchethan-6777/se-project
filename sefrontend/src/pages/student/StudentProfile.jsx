import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { authUtils, userUtils } from '../../utils/auth';
import { useTheme } from '../../utils/ThemeContext';

// A simple back button if you don't have one
const BackButton = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  
  return (
    <button
      onClick={() => navigate(-1)}
      className={`mb-4 inline-flex items-center gap-2 text-sm font-medium ${
        darkMode 
          ? 'text-gray-300 hover:text-white' 
          : 'text-gray-600 hover:text-gray-900'
      } transition-colors duration-200`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Back
    </button>
  );
};


const StudentProfile = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promotionForm, setPromotionForm] = useState({
    email: '',
    invitationCode: ''
  });
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionMessage, setPromotionMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      setPromotionForm(prev => ({
        ...prev,
        email: response.data.email
      }));
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToFaculty = async (e) => {
    e.preventDefault();
    setPromotionLoading(true);
    setPromotionMessage({ text: '', type: '' });

    try {
      const response = await authAPI.promoteToFaculty(
        promotionForm.email,
        promotionForm.invitationCode
      );

      // Backend returns a string on success
      setPromotionMessage({ 
        text: 'Successfully promoted! Please log out and log back in to see changes.', 
        type: 'success' 
      });

      // Update user in storage (this is temporary, logout is needed)
      userUtils.setUser({ ...user, role: 'Faculty' });

      // Force a re-login to get the new JWT with the updated role
      setTimeout(() => {
        authUtils.logout();
      }, 2500);

    } catch (err) {
      console.error('Error promoting to faculty:', err);
      const errorMsg = err.response?.data || 'Promotion failed. Please check your invitation code.';
      setPromotionMessage({ text: errorMsg, type: 'error' });
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPromotionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <h3 className="text-sm font-medium text-red-800">Error</h3>
        <p className="mt-2 text-sm text-red-700">{error || 'User details not found'}</p>
      </div>
    );
  }

  // --- Merged Visual + Functional Layout ---
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton />
      
      <h1 className={`text-3xl font-bold ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>Your Profile</h1>

      <div className={`${
        darkMode 
          ? 'bg-gray-800 shadow-lg shadow-gray-900/50' 
          : 'bg-white shadow-xl'
      } rounded-lg p-6 md:p-8 transition-colors duration-200`}>
        {/* User Information Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          {/* Avatar */}
          <div className="relative group">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=2563eb&textColor=ffffff&size=128`}
              alt="Profile Avatar"
              className={`w-32 h-32 rounded-full border-4 ${
                darkMode 
                  ? 'border-primary-400 shadow-lg shadow-primary-500/20' 
                  : 'border-primary-500 shadow-sm'
              } transition-all duration-200 group-hover:scale-105`}
            />
            <div className={`absolute inset-0 rounded-full ${
              darkMode ? 'bg-primary-400/20' : 'bg-primary-500/10'
            } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}></div>
          </div>
          {/* Details */}
          <div className="w-full space-y-4">
            <div>
              <label className={`text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Full Name</label>
              <p className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>{user.name}</p>
            </div>
            <div>
              <label className={`text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Email Address</label>
              <p className={`text-lg ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>{user.email}</p>
            </div>
            <div>
              <label className={`text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Role</label>
              <p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  darkMode 
                    ? 'bg-primary-900/50 text-primary-200' 
                    : 'bg-primary-100 text-primary-800'
                } capitalize transition-colors duration-200`}>
                  {user.role}
                </span>
              </p>
            </div>
            <div>
              <label className={`text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>User ID</label>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>{user.id}</p>
            </div>
          </div>
        </div>

        {/* Faculty Promotion Form */}
        {user.role === 'Student' && (
          <div className={`border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          } pt-6 mt-8`}>
            <h2 className={`text-xl font-semibold ${
              darkMode ? 'text-white' : 'text-gray-800'
            } mb-4`}>Become a Faculty Member</h2>
            <p className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            } mb-6 max-w-2xl`}>
              If you have an invitation code from an administrator, you can promote your account to Faculty status.
              This will give you access to create and manage quizzes.
            </p>
            <form onSubmit={handlePromoteToFaculty} className="space-y-4 max-w-lg">
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Your Email (auto-filled)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={promotionForm.email}
                  readOnly
                  className={`mt-1 block w-full rounded-md shadow-sm cursor-not-allowed focus:ring-0 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                />
              </div>
              <div>
                <label htmlFor="invitationCode" className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Faculty Invitation Code
                </label>
                <input
                  type="text"
                  id="invitationCode"
                  name="invitationCode"
                  value={promotionForm.invitationCode}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-400 focus:ring-primary-400' 
                      : 'border-gray-300 text-gray-900 focus:border-primary-500 focus:ring-primary-500'
                  } transition-colors duration-200`}
                  placeholder={darkMode ? 'Enter code here...' : 'Enter your invitation code'}
                  required
                />
              </div>
              
              {promotionMessage.text && (
                <div className={`text-sm p-3 rounded-md ${
                  promotionMessage.type === 'success' 
                    ? darkMode 
                      ? 'bg-green-900/50 text-green-200 border border-green-700' 
                      : 'bg-green-50 text-green-700 border border-green-200'
                    : darkMode 
                      ? 'bg-red-900/50 text-red-200 border border-red-700' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                } transition-colors duration-200`}>
                  {promotionMessage.text}
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={promotionLoading}
                  className={`inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    promotionLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {promotionLoading ? 'Processing...' : 'Promote to Faculty'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Faculty/Admin Status */}
        {user.role !== 'Student' && (
          <div className="border-t border-gray-200 pt-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Status</h2>
            <p className="text-gray-600">Your account has elevated privileges: **{user.role}**.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;