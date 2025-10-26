import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../utils/api';
import { authUtils } from '../../utils/auth'; // Optional: for display name

const StudentMyAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyAttempts();
  }, []);

  const fetchMyAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentAPI.getMyAttempts();
      setAttempts(response.data || []);
    } catch (err) {
      setError('Failed to fetch past quiz attempts.');
      console.error('Error fetching attempts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    try {
      return new Date(dateTime).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your attempts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // ... (Error display component, similar to other pages) ...
     return (
       <div className="bg-red-50 border border-red-200 rounded-md p-4">
          {/* ... Error display structure ... */}
          <p>{error}</p>
          <button onClick={fetchMyAttempts}>Try Again</button>
       </div>
     );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900">My Quiz Attempts</h1>
        <p className="text-gray-600 mt-1">Review your past quiz results.</p>
      </div>

      {/* Attempts Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {attempts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            You haven't completed any quizzes yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attempts.map((attempt) => (
                  <tr key={attempt.attemptId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attempt.quizTitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attempt.quizSubject || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(attempt.submissionTime)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attempt.score ?? 'N/A'} / {attempt.quizTotalMarks ?? '?'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/student/quiz/result/${attempt.attemptId}`} // Link to existing result page
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Result
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
       <div className="text-center mt-6">
            <button
                onClick={() => navigate('/student/dashboard')}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-300 transition"
            >
                Back to Dashboard
            </button>
       </div>
    </div>
  );
};

export default StudentMyAttempts;