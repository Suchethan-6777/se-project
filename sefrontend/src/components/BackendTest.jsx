import React, { useState } from 'react';
import { authAPI } from '../utils/api';

const BackendTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    try {
      setLoading(true);
    setResult(null);
    
    console.log('Testing backend connection...');
    const response = await authAPI.health();
    console.log('Backend response:', response);
    setResult({ success: true, data: response.data });
  } catch (error) {
    console.error('Backend test failed:', error);
    setResult({ 
      success: false, 
      error: error.message,
      details: error.response?.data || error.response?.statusText
    });
  } finally {
    setLoading(false);
  }
};

return (
  <div className="p-4 border rounded-lg">
    <h3 className="text-lg font-semibold mb-4">Backend Connection Test</h3>
    <button
      onClick={testBackend}
      disabled={loading}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {loading ? 'Testing...' : 'Test Backend'}
    </button>
    
    {result && (
      <div className="mt-4 p-4 rounded-lg">
        {result.success ? (
          <div className="text-green-600">
            <h4 className="font-semibold">✅ Backend is working!</h4>
            <pre className="mt-2 text-sm">{JSON.stringify(result.data, null, 2)}</pre>
          </div>
        ) : (
          <div className="text-red-600">
            <h4 className="font-semibold">❌ Backend connection failed</h4>
            <p className="text-sm">Error: {result.error}</p>
            {result.details && (
              <pre className="mt-2 text-sm">{JSON.stringify(result.details, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    )}
  </div>
);
};

export default BackendTest;
