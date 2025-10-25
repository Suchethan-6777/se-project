import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizAPI } from '../../utils/api';

const QuizInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizDetails();
  }, [id]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getAssignedQuizzes();
      const foundQuiz = response.data.find(q => q.id === parseInt(id));
      
      if (!foundQuiz) {
        setError('Quiz not found');
        return;
      }
      
      setQuiz(foundQuiz);
    } catch (err) {
      setError('Failed to fetch quiz details');
      console.error('Error fetching quiz:', err);
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
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (endTime && now > endTime) {
      return { status: 'expired', color: 'bg-red-100 text-red-800' };
    } else if (quiz.status === 'PUBLISHED') {
      return { status: 'available', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'draft', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleStartQuiz = () => {
    navigate(`/student/quiz/${id}/taking`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
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
              <p>{error || 'Quiz not found'}</p>
            </div>
            <div className="mt-4">
              <Link
                to="/student/dashboard"
                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition duration-150 ease-in-out"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = getQuizStatus(quiz);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
  <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
          </span>
        </div>
        <p className="text-gray-600">{quiz.description}</p>
      </div>

      {/* Quiz Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subject:</span>
              <span className="font-medium">{quiz.subject || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{quiz.durationInMinutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Marks:</span>
              <span className="font-medium">{quiz.totalMarks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of Questions:</span>
              <span className="font-medium">{quiz.questions?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">{quiz.status}</span>
            </div>
          </div>
        </div>

  <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timing</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Start Time:</span>
              <p className="font-medium">{formatDateTime(quiz.startTime)}</p>
            </div>
            <div>
              <span className="text-gray-600">End Time:</span>
              <p className="font-medium">{formatDateTime(quiz.endTime)}</p>
            </div>
            <div>
              <span className="text-gray-600">Assignment Criteria:</span>
              <p className="font-medium text-sm">{quiz.assignmentCriteria || 'Open to all students'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
  <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
        <div className="prose max-w-none">
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>This quiz contains <strong>{quiz.questions?.length || 0} questions</strong> and must be completed in <strong>{quiz.durationInMinutes} minutes</strong>.</li>
            <li>Each question has <strong>4 options</strong> - select the most appropriate answer.</li>
            <li>You can navigate between questions using the navigation buttons.</li>
            <li>You can change your answers before submitting the quiz.</li>
            <li>Once you submit the quiz, you cannot make any changes.</li>
            <li>Make sure you have a stable internet connection throughout the quiz.</li>
            <li>Do not refresh the page or close the browser during the quiz.</li>
            <li>Your answers will be automatically saved as you progress.</li>
            <li>If you run out of time, the quiz will be automatically submitted.</li>
            <li>Your score will be displayed immediately after submission.</li>
          </ul>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Ensure you have sufficient time to complete the quiz before starting.</li>
                <li>Read each question carefully before selecting your answer.</li>
                <li>If you encounter any technical issues, contact your instructor immediately.</li>
                <li>Academic integrity is expected - complete the quiz independently.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
  <div className="flex justify-between items-center card">
        <Link
          to="/student/dashboard"
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-400 transition duration-150 ease-in-out"
        >
          Back to Dashboard
        </Link>
        
        <div className="flex space-x-4">
          {status.status === 'available' ? (
            <button
              onClick={handleStartQuiz}
              className="bg-primary-600 text-white px-8 py-2 rounded-md font-medium hover:bg-primary-700 transition duration-150 ease-in-out transform hover:scale-105"
            >
              Start Quiz
            </button>
          ) : status.status === 'upcoming' ? (
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-8 py-2 rounded-md font-medium cursor-not-allowed"
            >
              Quiz Not Available Yet
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-8 py-2 rounded-md font-medium cursor-not-allowed"
            >
              {status.status === 'expired' ? 'Quiz Expired' : 'Quiz Not Published'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizInstructions;

