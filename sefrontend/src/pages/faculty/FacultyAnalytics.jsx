import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../../utils/api';
import { authUtils } from '../../utils/auth';

const FacultyAnalytics = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getMyQuizzes();
      setQuizzes(response.data.filter(quiz => quiz.status === 'PUBLISHED'));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err.response?.data?.message || 'Failed to fetch quizzes');
      setLoading(false);
    }
  };

  const fetchSubmissions = async (quizId) => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuizSubmissions(quizId);
      setSubmissions(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err.response?.data?.message || 'Failed to fetch submissions');
      setLoading(false);
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
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
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error Loading Analytics</h3>
            <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={fetchQuizzes}
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">View and analyze student performance in your quizzes</p>
      </div>

      {/* Quiz List and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quiz List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Published Quizzes</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {quizzes.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No published quizzes found</p>
                </div>
              ) : (
                quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      fetchSubmissions(quiz.id);
                    }}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      selectedQuiz?.id === quiz.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900 dark:text-white">{quiz.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {quiz.questions?.length || 0} questions
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Analytics Display */}
        <div className="lg:col-span-3">
          {!selectedQuiz ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Quiz Selected</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select a quiz from the list to view analytics
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quiz Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{selectedQuiz.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Submissions</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{submissions.length}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {submissions.length > 0
                        ? Math.round(
                            (submissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / submissions.length) * 100
                          ) / 100
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Questions</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedQuiz.questions?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Submissions</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Submitted At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Time Taken
                        </th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {submissions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No submissions yet
                          </td>
                        </tr>
                      ) : (
                        submissions.map((submission) => (
                          <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {submission.student?.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {submission.student?.email || 'No email'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{submission.score || 0}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                out of {selectedQuiz.questions?.length || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {new Date(submission.submittedAt).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(submission.submittedAt).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {Math.round((new Date(submission.submittedAt) - new Date(submission.startedAt)) / 1000 / 60)}
                              {' mins'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                to={`/faculty/quiz/${selectedQuiz.id}/submission/${submission.id}`}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyAnalytics;