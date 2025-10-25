import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../../utils/api';
import { authUtils } from '../../utils/auth';
import BackendTest from '../../components/BackendTest';
import AuthTest from '../../components/AuthTest';

const FacultyDashboard = () => {
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state
      
      // Verify we have auth token
      if (!authUtils.isAuthenticated()) {
        console.error('No authentication token found');
        throw new Error('Authentication required');
      }

      // Debug: Check token details
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      console.log('Token exists:', !!token);
      console.log('User exists:', !!user);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('User data:', user);

      console.log('Fetching dashboard data...');
      const response = await quizAPI.getMyQuizzes();
      
      // Verify response
      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      console.log('Dashboard data fetched successfully:', response.data);
      setMyQuizzes(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMessage = 'Failed to fetch dashboard data';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // If unauthorized, trigger re-auth
      if (err.response?.status === 401) {
        console.log('Unauthorized - redirecting to login');
        authUtils.logout();
      }
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

    if (startTime && now < startTime) {
      return { 
        status: 'upcoming', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-1 dark:ring-blue-800/50' 
      };
    } else if (endTime && now > endTime) {
      return { 
        status: 'expired', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:ring-1 dark:ring-red-800/50' 
      };
    } else if (quiz.status === 'PUBLISHED') {
      return { 
        status: 'active', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:ring-1 dark:ring-green-800/50' 
      };
    } else {
      return { status: 'draft', color: 'bg-gray-100 text-gray-800' };
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl p-6 shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Error Loading Dashboard</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-200">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium 
                  bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 
                  hover:bg-red-200 dark:hover:bg-red-800/40 
                  ring-1 ring-red-200 dark:ring-red-800/50
                  transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
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
      {/* Backend Test - Remove this after testing */}
      
      
      {/* Auth Test - Remove this after testing */}
      
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 transform hover:scale-[1.01] transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {authUtils.getUserDisplayName()}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
              Manage your quizzes and track student performance
            </p>
          </div>
          <div className="text-right bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Quizzes Created</p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{myQuizzes.length}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center ring-1 ring-primary-400/30 dark:ring-primary-700/50">
                <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{myQuizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center ring-1 ring-green-400/30 dark:ring-green-700/50">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Quizzes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {myQuizzes.filter(q => getQuizStatus(q).status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center ring-1 ring-blue-400/30 dark:ring-blue-700/50">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Draft Quizzes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {myQuizzes.filter(q => getQuizStatus(q).status === 'draft').length}
              </p>
            </div>
          </div>
        </div>


      </div>

      {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/faculty/quiz/create"
              className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-200 transform hover:scale-105 group"
          >
            <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 ring-1 ring-primary-400/30 dark:ring-primary-700/50">
                  <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Create Quiz</p>
            </div>
          </Link>

          <Link
            to="/faculty/questions"
              className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-200 transform hover:scale-105 group"
          >
            <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 ring-1 ring-green-400/30 dark:ring-green-700/50">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Question Bank</p>
            </div>
          </Link>

          <Link
            to="/faculty/my-quizzes"
              className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-200 transform hover:scale-105 group"
          >
            <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 ring-1 ring-blue-400/30 dark:ring-blue-700/50">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">My Quizzes</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Quizzes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">My Recent Quizzes</h2>
          {myQuizzes.length > 0 && (
            <Link
              to="/faculty/my-quizzes"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
            >
              View all
            </Link>
          )}
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {myQuizzes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No quizzes created</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first quiz.</p>
              <div className="mt-6">
                <Link
                  to="/faculty/quiz/create"
                  className="bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-primary-700 hover:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Create Quiz
                </Link>
              </div>
            </div>
          ) : (
            myQuizzes.slice(0, 5).map((quiz) => {
              const status = getQuizStatus(quiz);
              return (
                <div key={quiz.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{quiz.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.subject || 'No subject'}</p>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                          {status.status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {quiz.questions?.length || 0} questions
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/faculty/quiz/${quiz.id}/submissions`}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;

