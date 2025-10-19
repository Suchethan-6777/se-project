// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import NotFound from "./components/NotFound";

// Common
import Login from "./components/Login";
import ProfilePage from "./components/ProfilePage";

// Student
import Dashboard from "./components/Dashboard";
import QuizSelectionPage from "./components/QuizSelectionPage";
import QuizInstructions from "./components/QuizInstructions";
import QuizTakingPage from "./components/QuizTakingPage";
import QuizResultPage from "./components/QuizResultPage";

// Faculty
import FacultyDashboard from "./components/FacultyDashboard";
import QuizFromPage from "./components/QuizFromPage";
import QuizListPage from "./components/QuizListPage";
import QuestionBankPage from "./components/QuestionBankPage";
import StudentPerformancePage from "./components/StudentPerformancePage";

// Admin
import AdminDashboard from "./components/AdminDashboard";
import UserManagementPage from "./components/UserManagementPage";
import ViewAllQuizzesPage from "./components/ViewAllQuizzesPage";
import ReportsPage from "./components/ReportsPage";
import SettingsPage from "./components/SettingsPage";
import NotificationsPage from "./components/NotificationsPage";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Student */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute role="student">
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz-selection"
        element={
          <ProtectedRoute role="student">
            <Layout>
              <QuizSelectionPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz-instructions/:id"
        element={
          <ProtectedRoute role="student">
            <Layout>
              <QuizInstructions />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz-taking/:id"
        element={
          <ProtectedRoute role="student">
            <Layout>
              <QuizTakingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz-result/:id"
        element={
          <ProtectedRoute role="student">
            <Layout>
              <QuizResultPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-profile"
        element={
          <ProtectedRoute role="student">
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Faculty */}
      <Route
        path="/faculty-dashboard"
        element={
          <ProtectedRoute role="faculty">
            <Layout>
              <FacultyDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-edit-quiz"
        element={
          <ProtectedRoute role="faculty">
            <Layout>
              <QuizFromPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty-quiz-list"
        element={
          <ProtectedRoute role="faculty">
            <Layout>
              <QuizListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/question-bank"
        element={
          <ProtectedRoute role="faculty">
            <Layout>
              <QuestionBankPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-performance"
        element={
          <ProtectedRoute role="faculty">
            <Layout>
              <StudentPerformancePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-users"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <UserManagementPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/view-all-quizzes"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <ViewAllQuizzesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-reports"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <NotificationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
