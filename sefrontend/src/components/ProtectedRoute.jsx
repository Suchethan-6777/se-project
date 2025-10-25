import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authUtils, userUtils, roleUtils } from '../utils/auth';

// Error boundary component for auth-related errors
class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Auth Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Clear auth data and redirect to login on auth error
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const isAuthenticated = authUtils.isAuthenticated();
  const userRole = userUtils.getUserRole();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles required, allow access
  if (allowedRoles.length === 0) {
    return children;
  }

  // Case-insensitive role check
  const hasAllowedRole = allowedRoles.some(role => 
    role.toLowerCase() === String(userRole).toLowerCase()
  );
  
  if (hasAllowedRole) {
    return children;
  }

  // If user doesn't have required role, redirect to their dashboard
  const roleBasedRedirect = {
    'Student': '/student/dashboard',
    'Faculty': '/faculty/dashboard',
    'Admin': '/admin/dashboard'
  };

  // Ensure we have a valid role, default to student if missing
  const safeUserRole = userRole || 'Student';
  const redirectPath = roleBasedRedirect[safeUserRole] || '/login';
  return <Navigate to={redirectPath} replace />;
};

// Wrap ProtectedRoute with error boundary
const ProtectedRouteWithErrorBoundary = (props) => (
  <AuthErrorBoundary>
    <ProtectedRoute {...props} />
  </AuthErrorBoundary>
);

export default ProtectedRouteWithErrorBoundary;

