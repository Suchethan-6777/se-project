import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Removed unused useLocation
import { studentAPI } from '../../utils/api';

const QuizResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  // Removed unused location state
  const [attempt, setAttempt] = useState(null); // This will hold the QuizAttemptResultDTO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttemptResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]); // Correct dependency array

  const fetchAttemptResult = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const response = await studentAPI.getAttemptResult(parseInt(attemptId));
      if (!response.data) {
          throw new Error("No data received for the attempt result.");
      }
      setAttempt(response.data); // Set the received DTO
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Unknown error";
      setError('Failed to fetch quiz result: ' + errorMsg);
      console.error('Error fetching attempt result:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not available';
    // Ensure dateTime is treated as a string before creating Date
    try {
      return new Date(dateTime).toLocaleString();
    } catch (e) {
      console.error("Error formatting date:", dateTime, e);
      return 'Invalid Date';
    }
  };

  // --- Helper Functions (getScoreColor, getScoreMessage) remain the same ---
  const getScoreColor = (score, totalMarks) => {
    if (!totalMarks || totalMarks === 0) return 'text-gray-600'; // Prevent division by zero
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score, totalMarks) => {
    if (!totalMarks || totalMarks === 0) return 'Result cannot be calculated.';
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 90) return 'Excellent work! 🎉';
    if (percentage >= 80) return 'Great job! 👍';
    if (percentage >= 70) return 'Good work!';
    if (percentage >= 60) return 'Not bad, keep practicing! 💪';
    return 'Keep studying and try again! 📚';
  };
  // --- End Helper Functions ---


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
            {/* Error Icon */}
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

  // *** USE DTO FIELDS ***
  const score = attempt.score ?? 0; // Use nullish coalescing
  const totalMarks = attempt.quizTotalMarks ?? 1; // Use DTO field, default to 1 if null/undefined
  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0; // Avoid division by zero


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card text-center p-6">
        <div className="mb-4">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            {/* Checkmark Icon */}
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
        {/* *** USE DTO FIELD *** */}
        <p className="text-gray-600">Here are your results for "{attempt.quizTitle}"</p>
      </div>

      {/* Score Display */}
      <div className="card p-8">
        <div className="text-center">
          <div className="mb-6">
            {/* *** USE DTO FIELD for totalMarks *** */}
            <div className={`text-6xl font-bold ${getScoreColor(score, totalMarks)} mb-2`}>
              {score}/{totalMarks}
            </div>
            <div className="text-2xl font-semibold text-gray-600 mb-4">
              {percentage.toFixed(1)}%
            </div>
            {/* *** USE DTO FIELD for totalMarks *** */}
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
              {/* *** USE DTO FIELD *** */}
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
              {/* *** USE DTO FIELD *** */}
              <span className="font-medium">{attempt.quizTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subject:</span>
              {/* *** USE DTO FIELD *** */}
              <span className="font-medium">{attempt.quizSubject || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              {/* *** USE DTO FIELD *** */}
              <span className="font-medium">{attempt.quizDurationMinutes} minutes</span>
            </div>
            {/* Removed Question Count as it's not in the DTO */}
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
                  ? Math.round((new Date(attempt.submissionTime).getTime() - new Date(attempt.startTime).getTime()) / 60000) // Use getTime() for reliability
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

      {/* Performance Analysis (Relies on percentage, should be fine) */}
      <div className="card">
         {/* ... (Performance messages based on percentage) ... */}
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