import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { isAuthenticated, getUserRole } from "@/utils/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "./pages/Login";
import LoginCallback from "./pages/LoginCallback";
import NotFound from "./pages/NotFound";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import QuizInstructions from "./pages/student/QuizInstructions";
import QuizTaking from "./pages/student/QuizTaking";
import QuizResult from "./pages/student/QuizResult";
import StudentProfile from "./pages/student/StudentProfile";

// Faculty Pages
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import MyQuizzes from "./pages/faculty/MyQuizzes";
import QuestionBank from "./pages/faculty/QuestionBank";
import QuizForm from "./pages/faculty/QuizForm";
import ViewSubmissions from "./pages/faculty/ViewSubmissions";
import FacultyAssignedQuizzes from "./pages/faculty/FacultyAssignedQuizzes";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminAllQuizzes from "./pages/admin/AdminAllQuizzes";

const queryClient = new QueryClient();

const HomeRedirect = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  const role = getUserRole();
  if (role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (role === 'FACULTY') {
    return <Navigate to="/faculty/dashboard" replace />;
  } else {
    return <Navigate to="/student/dashboard" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/login/callback" element={<LoginCallback />} />
            <Route path="/" element={<HomeRedirect />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']}><Layout /></ProtectedRoute>}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/quiz/:id/instructions" element={<QuizInstructions />} />
              <Route path="/student/quiz/:id/taking" element={<QuizTaking />} />
              <Route path="/student/quiz/result/:attemptId" element={<QuizResult />} />
              <Route path="/student/profile" element={<StudentProfile />} />
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['FACULTY']}><Layout /></ProtectedRoute>}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/my-quizzes" element={<MyQuizzes />} />
              <Route path="/faculty/questions" element={<QuestionBank />} />
              <Route path="/faculty/quiz/create" element={<QuizForm />} />
              <Route path="/faculty/quiz/edit/:id" element={<QuizForm />} />
              <Route path="/faculty/quiz/:quizId/submissions" element={<ViewSubmissions />} />
              <Route path="/faculty/quizzes" element={<FacultyAssignedQuizzes />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout /></ProtectedRoute>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/all-quizzes" element={<AdminAllQuizzes />} />
              <Route path="/admin/questions" element={<QuestionBank />} />
              <Route path="/admin/quiz/create" element={<QuizForm />} />
              <Route path="/admin/quiz/edit/:id" element={<QuizForm />} />
              <Route path="/admin/quiz/:quizId/submissions" element={<ViewSubmissions />} />
              <Route path="/admin/quizzes" element={<FacultyAssignedQuizzes />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
