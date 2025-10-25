import axios from 'axios';

// Base URL for the backend API
const BASE_URL = 'http://localhost:8080';

// Base Auth URL for OAuth
const BASE_AUTH_URL = 'http://localhost:8080/oauth2/authorization/google';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding JWT token to request:', config.url);
    } else {
      console.warn('No JWT token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error('Access denied: Insufficient permissions');
    } else if (error.code === 'ERR_NETWORK') {
      // Network error - backend might be down
      console.error('Network error: Backend might be down');
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  // Health check endpoint
  health: () => api.get('/auth/health'),
  // Get current user details
  getCurrentUser: () => api.get('/auth/me'),
  
  // Promote user to faculty
  promoteToFaculty: (email, invitationCode) =>
    api.post('/auth/promote-to-faculty', { email, invitationCode }),
};

export const quizAPI = {
  // Get quizzes assigned to current user
  getAssignedQuizzes: () => api.get('/api/quizzes/assigned-to-me'),
  
  // Faculty/Admin: Get quizzes created by self
  getMyQuizzes: () => api.get('/api/quizzes'),
  
  // Faculty/Admin: Create quiz
  createQuiz: (quizData) => api.post('/api/quizzes', quizData),
  
  // Faculty/Admin: Update quiz
  updateQuiz: (id, quizData) => api.put(`/api/quizzes/${id}`, quizData),
  
  // Faculty/Admin: Delete quiz
  deleteQuiz: (id) => api.delete(`/api/quizzes/${id}`),
  
  // Faculty/Admin: Get submissions for a quiz
  getQuizSubmissions: (quizId) => api.get(`/api/quizzes/${quizId}/submissions`),

  // Faculty: Get analytics for a quiz
  getQuizAnalytics: (quizId) => api.get(`/api/quizzes/${quizId}/analytics`),
  
  // Faculty: Get submission details
  getSubmissionDetails: (quizId, submissionId) => 
    api.get(`/api/quizzes/${quizId}/submissions/${submissionId}`),
};

export const questionAPI = {
  // Get all questions
  getAllQuestions: () => api.get('/api/questions/all'),
  
  // Get questions by category
  getQuestionsByCategory: (category) => api.get(`/api/questions/category/${category}`),
  
  // Add question
  addQuestion: (questionData) => api.post('/api/questions/add', questionData),
  
  // Update question
  updateQuestion: (id, questionData) => api.put(`/api/questions/replace/${id}`, questionData),
  
  // Delete question
  deleteQuestion: (id) => api.delete(`/api/questions/delete/${id}`),
};

export const studentAPI = {
  // Start quiz attempt
  startQuiz: (quizId) => api.post(`/api/student/quizzes/${quizId}/attempt`),
  
  // Submit quiz answers
  submitQuiz: (attemptId, responses) => 
    api.post(`/api/student/quizzes/attempt/${attemptId}/submit`, responses),
  
  // Get attempt result
  getAttemptResult: (attemptId) => api.get(`/api/student/attempts/${attemptId}`),
};

export const adminAPI = {
  // Get all users
  getAllUsers: () => api.get('/api/admin/users'),
  
  // Update user role
  updateUserRole: (userId, newRole) => 
    api.put(`/api/admin/users/${userId}/role?newRole=${newRole}`),
  
  // Delete user
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  
  // Get all quizzes (admin only)
  getAllQuizzes: () => api.get('/api/admin/quizzes'),
  
  // Delete any quiz (admin only)
  deleteAnyQuiz: (quizId) => api.delete(`/api/admin/quizzes/${quizId}`),
};

// OAuth2 login redirect
export const oauthLogin = () => {
  window.location.href = `${BASE_URL}/oauth2/authorization/google`;
};

export default api;

