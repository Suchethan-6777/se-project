import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../../utils/api';

const FacultyMyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchMyQuizzes();
  }, []);

  const fetchMyQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getMyQuizzes();
      setQuizzes(response.data);
    } catch (err) {
      setError('Failed to fetch your quizzes');
      console.error('Error fetching my quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(quizId);
      await quizAPI.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (err) {
      alert('Failed to delete quiz. Please try again.');
      console.error('Error deleting quiz:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not specified';
    return new Date(dateTime).toLocaleString();
  };

  const getQuizStatus = (quiz) => {
    // Always treat DRAFT as draft, regardless of dates
    if (quiz.status === 'DRAFT') {
      return { status: 'draft', color: 'bg-gray-100 text-gray-800' };
    }
    const now = new Date();
    const startTime = quiz.startTime ? new Date(quiz.startTime) : null;
    const endTime = quiz.endTime ? new Date(quiz.endTime) : null;
    if (startTime && now < startTime) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (endTime && now > endTime) {
      return { status: 'expired', color: 'bg-red-100 text-red-800' };
    } else if (quiz.status === 'PUBLISHED') {
      return { status: 'active', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'draft', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const status = getQuizStatus(quiz);
    switch (filter) {
      case 'active':
        return status.status === 'active';
      case 'upcoming':
        return status.status === 'upcoming';
      case 'expired':
        return status.status === 'expired';
      case 'draft':
        return status.status === 'draft';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your quizzes...</p>
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
                onClick={fetchMyQuizzes}
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Quizzes</h1>
            <p className="text-gray-600 mt-1">Manage quizzes you have created</p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/faculty/quiz/create"
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition duration-150 ease-in-out"
            >
              Create New Quiz
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'all', label: 'All', count: quizzes.length },
            { key: 'active', label: 'Active', count: quizzes.filter(q => getQuizStatus(q).status === 'active').length },
            { key: 'upcoming', label: 'Upcoming', count: quizzes.filter(q => getQuizStatus(q).status === 'upcoming').length },
            { key: 'expired', label: 'Expired', count: quizzes.filter(q => getQuizStatus(q).status === 'expired').length },
            { key: 'draft', label: 'Draft', count: quizzes.filter(q => getQuizStatus(q).status === 'draft').length },
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

      {/* Quizzes Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredQuizzes.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'You haven\'t created any quizzes yet.'
                : `No ${filter} quizzes found.`
              }
            </p>
            {filter === 'all' && (
              <div className="mt-6">
                <Link
                  to="/faculty/quiz/create"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition duration-150 ease-in-out"
                >
                  Create Your First Quiz
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuizzes.map((quiz) => {
                  const status = getQuizStatus(quiz);
                  return (
                    <tr key={quiz.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                          <div className="text-sm text-gray-500">{quiz.subject || 'No subject'}</div>
                          <div className="text-xs text-gray-400">{quiz.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quiz.durationInMinutes} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quiz.questions?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(quiz.startTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/faculty/quiz/${quiz.id}/submissions`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </Link>
                          <Link
                            to={`/faculty/quiz/edit/${quiz.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            disabled={deleteLoading === quiz.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deleteLoading === quiz.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyMyQuizzes;

