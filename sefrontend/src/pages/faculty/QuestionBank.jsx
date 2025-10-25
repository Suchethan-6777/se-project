import React, { useState, useEffect } from 'react';
import { questionAPI } from '../../utils/api';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [formData, setFormData] = useState({
    questionTitle: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    rightAnswer: '',
    category: '',
    difficultyLevel: 'Easy'
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getAllQuestions();
      setQuestions(response.data);
    } catch (err) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingQuestion) {
        await questionAPI.updateQuestion(editingQuestion.id, formData);
      } else {
        await questionAPI.addQuestion(formData);
      }
      
      setShowAddForm(false);
      setEditingQuestion(null);
      setFormData({
        questionTitle: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        rightAnswer: '',
        category: '',
        difficultyLevel: 'Easy'
      });
      
      fetchQuestions();
    } catch (err) {
      setError('Failed to save question');
      console.error('Error saving question:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      questionTitle: question.questionTitle,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      rightAnswer: question.rightAnswer,
      category: question.category,
      difficultyLevel: question.difficultyLevel
    });
    setShowAddForm(true);
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      setDeleteLoading(questionId);
      await questionAPI.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      alert('Failed to delete question');
      console.error('Error deleting question:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingQuestion(null);
    setFormData({
      questionTitle: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      rightAnswer: '',
      category: '',
      difficultyLevel: 'Easy'
    });
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.questionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && question.difficultyLevel === filter;
  });

  const categories = [...new Set(questions.map(q => q.category).filter(Boolean))];

  if (loading && !showAddForm) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
            <p className="text-gray-600 mt-1">Manage your question database</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition duration-150 ease-in-out"
          >
            Add New Question
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
  <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="questionTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Question *
                </label>
                <textarea
                  id="questionTitle"
                  name="questionTitle"
                  value={formData.questionTitle}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your question"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Mathematics, Science"
                />
              </div>

              <div>
                <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  id="difficultyLevel"
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label htmlFor="option1" className="block text-sm font-medium text-gray-700 mb-2">
                  Option A *
                </label>
                <input
                  type="text"
                  id="option1"
                  name="option1"
                  value={formData.option1}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="option2" className="block text-sm font-medium text-gray-700 mb-2">
                  Option B *
                </label>
                <input
                  type="text"
                  id="option2"
                  name="option2"
                  value={formData.option2}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="option3" className="block text-sm font-medium text-gray-700 mb-2">
                  Option C *
                </label>
                <input
                  type="text"
                  id="option3"
                  name="option3"
                  value={formData.option3}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="option4" className="block text-sm font-medium text-gray-700 mb-2">
                  Option D *
                </label>
                <input
                  type="text"
                  id="option4"
                  name="option4"
                  value={formData.option4}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="rightAnswer" className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer *
                </label>
                <select
                  id="rightAnswer"
                  name="rightAnswer"
                  value={formData.rightAnswer}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select correct answer</option>
                  <option value={formData.option1}>A. {formData.option1}</option>
                  <option value={formData.option2}>B. {formData.option2}</option>
                  <option value={formData.option3}>C. {formData.option3}</option>
                  <option value={formData.option4}>D. {formData.option4}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-400 transition duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 transition duration-150 ease-in-out disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search */}
  <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first question.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{question.questionTitle}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        question.difficultyLevel === 'Easy' ? 'bg-green-100 text-green-800' :
                        question.difficultyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficultyLevel}
                      </span>
                      {question.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {question.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-700">A.</span>
                          <span className={`${question.rightAnswer === question.option1 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                            {question.option1}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-700">B.</span>
                          <span className={`${question.rightAnswer === question.option2 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                            {question.option2}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-700">C.</span>
                          <span className={`${question.rightAnswer === question.option3 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                            {question.option3}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-700">D.</span>
                          <span className={`${question.rightAnswer === question.option4 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                            {question.option4}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      disabled={deleteLoading === question.id}
                      className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                    >
                      {deleteLoading === question.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;

