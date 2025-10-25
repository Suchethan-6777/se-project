import React, { useState } from 'react';
import { authUtils, tokenUtils, userUtils } from '../utils/auth';
import { authAPI } from '../utils/api';

const AuthTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      console.log('=== AUTHENTICATION TEST ===');
      
      // Check if user is authenticated
      const isAuth = authUtils.isAuthenticated();
      console.log('Is authenticated:', isAuth);
      
      // Check token
      const token = tokenUtils.getToken();
      console.log('Token exists:', !!token);
      console.log('Token valid:', tokenUtils.isTokenValid());
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
      
      // Check user data
      const user = userUtils.getUser();
      console.log('User data:', user);
      console.log('User role:', userUtils.getUserRole());
      
      // Test API call
      console.log('Testing API call...');
      const response = await authAPI.getCurrentUser();
      console.log('API response:', response.data);
      
      setResult({ 
        success: true, 
        data: {
          isAuthenticated: isAuth,
          hasToken: !!token,
          tokenValid: tokenUtils.isTokenValid(),
          userRole: userUtils.getUserRole(),
          apiResponse: response.data
        }
      });
      
    } catch (error) {
      console.error('Auth test failed:', error);
      setResult({ 
        success: false, 
        error: error.message,
        details: error.response?.data || error.response?.statusText
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    authUtils.logout();
    setResult(null);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4">Authentication Test</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testAuth}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </button>
        
        <button
          onClick={clearAuth}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
        >
          Clear Auth & Logout
        </button>
      </div>
      
      {result && (
        <div className="mt-4 p-4 rounded-lg">
          {result.success ? (
            <div className="text-green-600">
              <h4 className="font-semibold">✅ Authentication Test Passed</h4>
              <pre className="mt-2 text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-red-600">
              <h4 className="font-semibold">❌ Authentication Test Failed</h4>
              <p className="text-sm">Error: {result.error}</p>
              {result.details && (
                <pre className="mt-2 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthTest;
