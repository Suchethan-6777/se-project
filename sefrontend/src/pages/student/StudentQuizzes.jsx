import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../../utils/api';

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAssignedQuizzes();
  }, []);

  const fetchAssignedQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getAssignedQuizzes();
      setQuizzes(response.data);
    } catch (err) {
      setError('Failed to fetch quizzes');
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not specified';
    return new Date(dateTime).toLocaleString();
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const startTime = quiz.startTime ? new Date(quiz.startTime) : null;
    const endTime = quiz.endTime ? new Date(quiz.endTime) : null;

    // Quiz must be published AND have start/end times
    if (!quiz.startTime || !quiz.endTime || quiz.status !== 'PUBLISHED') {
      return { status: 'draft', color: 'bg-gray-100 text-gray-800' };
    }

    if (now < startTime) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now > endTime) {
      return { status: 'expired', color: 'bg-red-100 text-red-800' };
    } else if (now >= startTime && now <= endTime) {
      // Only show as available if current time is within the window
      return { status: 'available', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'draft', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const status = getQuizStatus(quiz);
    switch (filter) {
      case 'available':
        return status.status === 'available';
      case 'upcoming':
        return status.status === 'upcoming';
      case 'expired':
        return status.status === 'expired';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchAssignedQuizzes}
                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition duration-150 ease-in-out"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assigned Quizzes</h1>
            <p className="text-gray-600 mt-1">View and take your assigned quizzes</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Quizzes</p>
            <p className="text-2xl font-bold text-primary-600">{quizzes.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'all', label: 'All', count: quizzes.length },
            { key: 'available', label: 'Available', count: quizzes.filter(q => getQuizStatus(q).status === 'available').length },
            { key: 'upcoming', label: 'Upcoming', count: quizzes.filter(q => getQuizStatus(q).status === 'upcoming').length },
            { key: 'expired', label: 'Expired', count: quizzes.filter(q => getQuizStatus(q).status === 'expired').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition duration-150 ease-in-out ${
                filter === tab.key
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'You don\'t have any quizzes assigned to you yet.'
                : `No ${filter} quizzes found.`
              }
            </p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => {
            const status = getQuizStatus(quiz);
            return (
              <div key={quiz.id} className="card hover:shadow-md transition duration-150 ease-in-out">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{quiz.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{quiz.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subject:</span>
                      <span className="text-gray-900">{quiz.subject || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="text-gray-900">{quiz.durationInMinutes} minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Marks:</span>
                      <span className="text-gray-900">{quiz.totalMarks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Questions:</span>
                      <span className="text-gray-900">{quiz.questions?.length || 0}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Start: {formatDateTime(quiz.startTime)}</div>
                      <div>End: {formatDateTime(quiz.endTime)}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    {status.status === 'available' && quiz.status === 'PUBLISHED' && quiz.startTime && quiz.endTime ? (
                      <Link
                        to={`/student/quiz/${quiz.id}/instructions`}
                        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-primary-700 transition duration-150 ease-in-out flex items-center justify-center"
                      >
                        Start Quiz
                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ) : status.status === 'upcoming' ? (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md text-sm font-medium cursor-not-allowed"
                        title={`Quiz will be available at ${new Date(quiz.startTime).toLocaleString()}`}
                      >
                        Not Available Yet
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md text-sm font-medium cursor-not-allowed"
                      >
                        {status.status === 'expired' ? 'Expired' : 'Draft'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentQuizzes;

