import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { storageUtils, authUtils } from '../utils/auth';

const LoginCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleLoginCallback = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('No authentication token received');
          setLoading(false);
          return;
        }

        // Save token temporarily
        storageUtils.saveAuthData(token, null);

        // Fetch user details from backend
        const response = await authAPI.getCurrentUser();
        const user = response.data;
        
        if (!user || !user.email) {
          throw new Error('Invalid user data received from server');
        }

        // Handle intent (signin vs register) saved before redirect
        const intent = (() => {
          try { return localStorage.getItem('authIntent'); } catch (e) { return null; }
        })();

        // If registration intent and backend returned no role, default to Student
        if (intent === 'register' && (!user.role || user.role === '')) {
          user.role = 'Student';
        }

        // Normalize role case before saving
        user.role = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : 'Student';
        
        // Save complete user data
        storageUtils.saveAuthData(token, user);

        // Clear intent flag
        try { localStorage.removeItem('authIntent'); } catch (e) {}

        // Redirect based on user role (keep proper case for route)
        const role = user.role.toLowerCase();
        navigate(`/${role}/dashboard`, { replace: true });
        
      } catch (err) {
        console.error('Login callback error:', err);
        setError('Authentication failed. Please try again.');
        setLoading(false);
      }
    };

    handleLoginCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4 shadow-md">
            <div className="spinner"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Completing Sign In...
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please wait while we set up your account
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full card text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default LoginCallback;

