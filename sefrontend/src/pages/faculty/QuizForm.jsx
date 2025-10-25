import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, questionAPI } from '../../utils/api';

const QuizForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    durationInMinutes: 30,
    totalMarks: 10,
    startTime: '',
    endTime: '',
    status: 'DRAFT',
    assignmentCriteria: '',
    questionIds: []
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions();
    if (isEdit) fetchQuizDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const response = await questionAPI.getAllQuestions();
      setQuestions(response.data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to fetch questions: ' + (err.response?.data?.message || err.message));
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getMyQuizzes();
      const quiz = response.data.find(q => q.id === parseInt(id));
      if (quiz) {
        setFormData({
          title: quiz.title || '',
          description: quiz.description || '',
          subject: quiz.subject || '',
          durationInMinutes: quiz.durationInMinutes || 30,
          totalMarks: quiz.totalMarks || 10,
          startTime: quiz.startTime ? new Date(quiz.startTime).toISOString().slice(0, 16) : '',
          endTime: quiz.endTime ? new Date(quiz.endTime).toISOString().slice(0, 16) : '',
          status: quiz.status || 'DRAFT',
          assignmentCriteria: quiz.assignmentCriteria || '',
          questionIds: quiz.questions?.map(q => q.id) || []
        });
        setSelectedQuestions(quiz.questions || []);
      }
    } catch (err) {
      setError('Failed to fetch quiz details');
      console.error('Error fetching quiz details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleQuestionToggle = (question) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.some(q => q.id === question.id);
      return isSelected ? prev.filter(q => q.id !== question.id) : [...prev, question];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const quizData = {
        ...formData,
        questionIds: selectedQuestions.map(q => q.id),
        questions: selectedQuestions
      };
      if (isEdit) {
        await quizAPI.updateQuiz(parseInt(id), quizData);
      } else {
        await quizAPI.createQuiz(quizData);
      }
      navigate('/faculty/my-quizzes');
    } catch (err) {
      setError('Failed to save quiz. Please try again.');
      console.error('Error saving quiz:', err);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">{isEdit ? 'Update your quiz details and questions' : 'Fill in the details to create a new quiz'}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700"><p>{error}</p></div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="form-label">Quiz Title *</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required className="form-input" placeholder="Enter quiz title" />
            </div>

            <div>
              <label htmlFor="subject" className="form-label">Subject</label>
              <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} className="form-input" placeholder="Enter subject" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="form-input" placeholder="Enter quiz description" />
            </div>
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="durationInMinutes" className="form-label">Duration (minutes) *</label>
              <input type="number" id="durationInMinutes" name="durationInMinutes" value={formData.durationInMinutes} onChange={handleInputChange} required min="1" className="form-input" />
            </div>

            <div>
              <label htmlFor="totalMarks" className="form-label">Total Marks *</label>
              <input type="number" id="totalMarks" name="totalMarks" value={formData.totalMarks} onChange={handleInputChange} required min="1" className="form-input" />
            </div>

            <div>
              <label htmlFor="startTime" className="form-label">Start Time</label>
              <input type="datetime-local" id="startTime" name="startTime" value={formData.startTime} onChange={handleInputChange} className="form-input" />
            </div>

            <div>
              <label htmlFor="endTime" className="form-label">End Time</label>
              <input type="datetime-local" id="endTime" name="endTime" value={formData.endTime} onChange={handleInputChange} className="form-input" />
            </div>

            <div>
              <label htmlFor="status" className="form-label">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="form-input">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div>
              <label htmlFor="assignmentCriteria" className="form-label">Assignment Criteria</label>
              <input type="text" id="assignmentCriteria" name="assignmentCriteria" value={formData.assignmentCriteria} onChange={handleInputChange} className="form-input" placeholder="e.g., roll numbers, emails (comma-separated)" />
            </div>
          </div>
        </div>

        {/* Question Selection */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Questions</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Choose questions from your question bank to include in this quiz. Selected: {selectedQuestions.length} questions</p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {questionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner mr-2"></div>
                <span className="text-gray-600 dark:text-gray-300">Loading questions...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No questions available. Create some questions first.</p>
                <button type="button" onClick={() => navigate('/faculty/questions')} className="mt-2 text-primary-600 hover:text-primary-900 text-sm font-medium">Go to Question Bank</button>
              </div>
            ) : (
              questions.map((question) => {
                const isSelected = selectedQuestions.some(q => q.id === question.id);
                return (
                  <div key={question.id} className={`p-4 border rounded-lg cursor-pointer transition duration-150 ease-in-out ${isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`} onClick={() => handleQuestionToggle(question)}>
                    <div className="flex items-start space-x-3">
                      <input type="checkbox" checked={isSelected} readOnly className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{question.questionTitle}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{question.category}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{question.difficultyLevel}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="space-y-1">
                            <div>A. {question.option1}</div>
                            <div>B. {question.option2}</div>
                            <div>C. {question.option3}</div>
                            <div>D. {question.option4}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="card flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/faculty/my-quizzes')} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition">Cancel</button>
          <button type="submit" disabled={loading || selectedQuestions.length === 0} className="btn-primary">{loading ? 'Saving...' : isEdit ? 'Update Quiz' : 'Create Quiz'}</button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;

