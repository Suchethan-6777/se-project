import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI, quizAPI } from '../../utils/api';

const QuizTaking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    startQuizAttempt();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && attemptId) {
      handleSubmitQuiz();
    }
  }, [timeLeft, attemptId]);

  const startQuizAttempt = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.startQuiz(parseInt(id));
      const data = response.data;
      
      setQuiz(data.quiz);
      setQuestions(data.questions || []);
      setAttemptId(data.attemptId);
      setTimeLeft(data.quiz.durationInMinutes * 60); // Convert to seconds
    } catch (err) {
      setError('Failed to start quiz: ' + (err.response?.data?.message || err.message));
      console.error('Error starting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      const responses = Object.entries(answers).map(([questionId, response]) => ({
        id: parseInt(questionId),
        response: response || ''
      }));

      const response = await studentAPI.submitQuiz(attemptId, responses);
      const score = response.data;
      
      navigate(`/student/quiz/result/${attemptId}`, { 
        state: { score, totalMarks: quiz.totalMarks } 
      });
    } catch (err) {
      setError('Failed to submit quiz');
      console.error('Error submitting quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4 dark:border-t-white"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz || !questions.length) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4 shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{error || 'Quiz not found or no questions available'}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/50 transition-all duration-200 transform hover:scale-105 shadow-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="text-right bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatTime(timeLeft)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Time Remaining</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 h-3 rounded-full transition-all duration-300 shadow-lg"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Question Navigation</h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => handleQuestionSelect(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-sm ${
                index === currentQuestionIndex
                  ? 'bg-primary-600 dark:bg-primary-500 text-white ring-2 ring-primary-600/50 dark:ring-primary-500/50'
                  : answers[questions[index].id]
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 ring-1 ring-green-400/30 dark:ring-green-700/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 ring-1 ring-gray-200 dark:ring-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Answered: {answeredQuestions}/{questions.length}</span>
          <span>Progress: {Math.round(progress)}%</span>
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Question {currentQuestionIndex + 1}
          </h2>
          <p className="text-gray-700 dark:text-gray-200 text-lg">{currentQuestion.questionTitle}</p>
        </div>

        <div className="space-y-3">
          {[
            { key: 'option1', label: 'A' },
            { key: 'option2', label: 'B' },
            { key: 'option3', label: 'C' },
            { key: 'option4', label: 'D' }
          ].map((option) => (
            <label
              key={option.key}
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${
                answers[currentQuestion.id] === currentQuestion[option.key]
                  ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={currentQuestion[option.key]}
                checked={answers[currentQuestion.id] === currentQuestion[option.key]}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="h-4 w-4 text-primary-600 dark:text-primary-500 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600"
              />
              <span className="ml-3 font-medium text-gray-700 dark:text-gray-200">{option.label}.</span>
              <span className="ml-2 text-gray-700 dark:text-gray-200">{currentQuestion[option.key]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
            currentQuestionIndex === 0
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm'
          }`}
        >
          Previous
        </button>

        <div className="flex space-x-4">
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className={`px-8 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg ${
                submitting 
                ? 'bg-green-500 dark:bg-green-600 text-white opacity-75 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 text-white hover:from-green-700 hover:to-green-600 dark:hover:from-green-600 dark:hover:to-green-500'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Warning for time running out */}
      {timeLeft <= 300 && timeLeft > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 shadow-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Time Warning</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>You have less than 5 minutes remaining. Please submit your quiz soon.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTaking;

