import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../../utils/api';
import { authUtils } from '../../utils/auth';

const FacultyAssignments = () => {
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignedQuizzes();
  }, []);

  const fetchAssignedQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getAssignedQuizzes();
      setAssignedQuizzes(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assigned quizzes:', err);
      setError(err.response?.data?.message || 'Failed to fetch assigned quizzes');
      setLoading(false);
    }
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const startTime = quiz.startTime ? new Date(quiz.startTime) : null;
    const endTime = quiz.endTime ? new Date(quiz.endTime) : null;

    if (startTime && now < startTime) {
      return {
        status: 'upcoming',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        description: `Starts ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`
      };
    } else if (endTime && now > endTime) {
      return {
        status: 'expired',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        description: `Ended ${endTime.toLocaleDateString()} at ${endTime.toLocaleTimeString()}`
      };
    } else {
      return {
        status: 'available',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        description: endTime ? `Due by ${endTime.toLocaleDateString()} at ${endTime.toLocaleTimeString()}` : 'No due date'
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin h-12 w-12 rounded-full border-4 border-t-primary-600 dark:border-t-primary-400 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute inset-0 h-12 w-12 animate-pulse opacity-50 rounded-full bg-primary-500/5 dark:bg-primary-400/10"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error Loading Assignments</h3>
            <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={fetchAssignedQuizzes}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Assignments</h1>
        <p className="text-gray-600 dark:text-gray-400">View and attempt quizzes assigned to you</p>
      </div>

      {/* Quiz Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Quizzes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {assignedQuizzes.filter(q => getQuizStatus(q).status === 'available').map((quiz) => (
              <div key={quiz.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <h3 className="font-medium text-gray-900 dark:text-white">{quiz.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{quiz.subject}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  By {quiz.createdBy?.name || 'Unknown'}
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {quiz.questions?.length || 0} questions
                  </span>
                  <Link
                    to={`/faculty/quiz/${quiz.id}/take`}
                    className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-800/40"
                  >
                    Start Quiz
                  </Link>
                </div>
              </div>
            ))}
            {assignedQuizzes.filter(q => getQuizStatus(q).status === 'available').length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No available quizzes
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Quizzes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {assignedQuizzes.filter(q => getQuizStatus(q).status === 'upcoming').map((quiz) => (
              <div key={quiz.id} className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white">{quiz.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{quiz.subject}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  By {quiz.createdBy?.name || 'Unknown'}
                </p>
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    getQuizStatus(quiz).color
                  }`}>
                    {getQuizStatus(quiz).description}
                  </span>
                </div>
              </div>
            ))}
            {assignedQuizzes.filter(q => getQuizStatus(q).status === 'upcoming').length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No upcoming quizzes
              </div>
            )}
          </div>
        </div>

        {/* Completed Quizzes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Completed</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {assignedQuizzes.filter(q => getQuizStatus(q).status === 'expired').map((quiz) => (
              <div key={quiz.id} className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white">{quiz.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{quiz.subject}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Score: {quiz.userScore || 0}/{quiz.questions?.length || 0}
                </p>
                <div className="mt-3">
                  <Link
                    to={`/faculty/quiz/${quiz.id}/result`}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm"
                  >
                    View Result
                  </Link>
                </div>
              </div>
            ))}
            {assignedQuizzes.filter(q => getQuizStatus(q).status === 'expired').length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No completed quizzes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyAssignments;