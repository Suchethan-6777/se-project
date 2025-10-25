import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { authUtils, userUtils } from './utils/auth';
import { ThemeProvider } from './utils/ThemeContext';

// Components
import Login from './components/Login';
import LoginCallback from './components/LoginCallback';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentQuizzes from './pages/student/StudentQuizzes';
import QuizInstructions from './pages/student/QuizInstructions';
import QuizTaking from './pages/student/QuizTaking';
import QuizResult from './pages/student/QuizResult';
import StudentProfile from './pages/student/StudentProfile';

import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyQuizzes from './pages/faculty/FacultyQuizzes';
import FacultyMyQuizzes from './pages/faculty/FacultyMyQuizzes';
import QuizForm from './pages/faculty/QuizForm';
import QuestionBank from './pages/faculty/QuestionBank';
import ViewSubmissions from './pages/faculty/ViewSubmissions';

import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminAllQuizzes from './pages/admin/AdminAllQuizzes';
import AdminProfile from './pages/admin/AdminProfile';
import FacultyProfile from './pages/faculty/FacultyProfile';
import FacultyAnalytics from './pages/faculty/FacultyAnalytics';
import FacultyAssignments from './pages/faculty/FacultyAssignments';

// NotFound component
const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <button
        onClick={() => window.history.back()}
        className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-150 ease-in-out"
      >
        Go Back
      </button>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/callback" element={<LoginCallback />} />
          <Route path="/" element={<Home />} />

          {/* Protected Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="quizzes" element={<StudentQuizzes />} />
            <Route path="quiz/:id/instructions" element={<QuizInstructions />} />
            <Route path="quiz/:id/taking" element={<QuizTaking />} />
            <Route path="quiz/result/:attemptId" element={<QuizResult />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
          </Route>

          {/* Protected Faculty Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['Faculty']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="quizzes" element={<FacultyQuizzes />} />
            <Route path="my-quizzes" element={<FacultyMyQuizzes />} />
            <Route path="quiz/create" element={<QuizForm />} />
            <Route path="quiz/edit/:id" element={<QuizForm />} />
            <Route path="questions" element={<QuestionBank />} />
            <Route path="quiz/:id/submissions" element={<ViewSubmissions />} />
            <Route path="profile" element={<FacultyProfile />} />
            <Route path="analytics" element={<FacultyAnalytics />} />
            <Route path="my-assignments" element={<FacultyAssignments />} />
            {/* Quiz taking routes for faculty */}
            <Route path="quiz/:id/take" element={<QuizTaking />} />
            <Route path="quiz/:id/instructions" element={<QuizInstructions />} />
            <Route path="quiz/result/:attemptId" element={<QuizResult />} />
            <Route path="*" element={<Navigate to="/faculty/dashboard" replace />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="all-quizzes" element={<AdminAllQuizzes />} />
            <Route path="quizzes" element={<FacultyQuizzes />} />
            <Route path="my-quizzes" element={<FacultyMyQuizzes />} />
            <Route path="quiz/create" element={<QuizForm />} />
            <Route path="quiz/edit/:id" element={<QuizForm />} />
            <Route path="questions" element={<QuestionBank />} />
            <Route path="quiz/:id/submissions" element={<ViewSubmissions />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Default redirect based on authentication */}
          <Route
            path="*"
            element={
              authUtils.isAuthenticated() ? (
                <Navigate
                  to={`/${(userUtils.getUserRole() || 'student').toLowerCase()}/dashboard`}
                  replace
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;