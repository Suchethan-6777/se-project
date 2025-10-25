import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { studentAPI } from '../../utils/api';

const QuizResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttemptResult();
  }, [attemptId]);

  const fetchAttemptResult = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAttemptResult(parseInt(attemptId));
      setAttempt(response.data);
    } catch (err) {
      setError('Failed to fetch quiz result');
      console.error('Error fetching attempt result:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not available';
    return new Date(dateTime).toLocaleString();
  };

  const getScoreColor = (score, totalMarks) => {
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score, totalMarks) => {
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 90) return 'Excellent work!';
    if (percentage >= 80) return 'Great job!';
    if (percentage >= 70) return 'Good work!';
    if (percentage >= 60) return 'Not bad, keep practicing!';
    return 'Keep studying and try again!';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your result...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
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
              <p>{error || 'Quiz result not found'}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition duration-150 ease-in-out"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const score = attempt.score || 0;
  const totalMarks = attempt.quiz?.totalMarks || 1;
  const percentage = (score / totalMarks) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
  {/* Header */}
  <div className="card text-center p-6">
        <div className="mb-4">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
        <p className="text-gray-600">Here are your results for "{attempt.quiz?.title}"</p>
      </div>

      {/* Score Display */}
      <div className="card p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className={`text-6xl font-bold ${getScoreColor(score, totalMarks)} mb-2`}>
              {score}/{totalMarks}
            </div>
            <div className="text-2xl font-semibold text-gray-600 mb-4">
              {percentage.toFixed(1)}%
            </div>
            <div className="text-lg text-gray-700">
              {getScoreMessage(score, totalMarks)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div 
              className={`h-4 rounded-full transition-all duration-1000 ${
                percentage >= 80 ? 'bg-green-500' : 
                percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{score}</div>
              <div className="text-sm text-gray-600">Marks Obtained</div>
            </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{totalMarks}</div>
              <div className="text-sm text-gray-600">Total Marks</div>
            </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{percentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Percentage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Quiz Title:</span>
              <span className="font-medium">{attempt.quiz?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subject:</span>
              <span className="font-medium">{attempt.quiz?.subject || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{attempt.quiz?.durationInMinutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Questions:</span>
              <span className="font-medium">{attempt.quiz?.questions?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attempt Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Start Time:</span>
              <span className="font-medium">{formatDateTime(attempt.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Submission Time:</span>
              <span className="font-medium">{formatDateTime(attempt.submissionTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Taken:</span>
              <span className="font-medium">
                {attempt.startTime && attempt.submissionTime 
                  ? Math.round((new Date(attempt.submissionTime) - new Date(attempt.startTime)) / 60000)
                  : 'N/A'
                } minutes
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h2>
        <div className="space-y-4">
          {percentage >= 80 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Outstanding Performance!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>You've demonstrated excellent understanding of the material. Keep up the great work!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : percentage >= 60 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Good Performance</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>You're on the right track! Consider reviewing the material to improve further.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Needs Improvement</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Consider reviewing the material and practicing more. Don't give up!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card flex justify-center space-x-4">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="bg-primary-600 text-white px-8 py-3 rounded-md font-medium hover:bg-primary-700 transition duration-150 ease-in-out"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => navigate('/student/quizzes')}
          className="bg-gray-300 text-gray-700 px-8 py-3 rounded-md font-medium hover:bg-gray-400 transition duration-150 ease-in-out"
        >
          View All Quizzes
        </button>
      </div>
    </div>
  );
};

export default QuizResult;

