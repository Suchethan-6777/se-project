import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '@/utils/auth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getUserRole();
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    const defaultRoute = userRole === 'ADMIN' 
      ? '/admin/dashboard' 
      : userRole === 'FACULTY' 
      ? '/faculty/dashboard' 
      : '/student/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;
