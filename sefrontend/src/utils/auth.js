// Use named import for jwt-decode
import { jwtDecode } from 'jwt-decode';

// JWT token utilities
export const tokenUtils = {
  // Get token from localStorage
  getToken: () => localStorage.getItem('token'),
  
  // Set token in localStorage
  setToken: (token) => localStorage.setItem('token', token),
  
  // Remove token from localStorage
  removeToken: () => localStorage.removeItem('token'),
  
  // Check if token exists and is valid
  isTokenValid: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },
  
  // Get decoded token data
  getTokenData: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }
};

// User data utilities
export const userUtils = {
  // Get user data from localStorage
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Set user data in localStorage
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  
  // Remove user data from localStorage
  removeUser: () => localStorage.removeItem('user'),
  
  // Get user role
  getUserRole: () => {
    const user = userUtils.getUser();
    // Ensure consistent casing for role comparison
    return user && user.role ? String(user.role).trim() : null;
  },
  
  // Check if user has specific role
  hasRole: (role) => {
    const userRole = userUtils.getUserRole();
    return userRole === role;
  },
  
  // Check if user is admin
  isAdmin: () => userUtils.hasRole('Admin'),
  
  // Check if user is faculty
  isFaculty: () => userUtils.hasRole('Faculty'),
  
  // Check if user is student
  isStudent: () => userUtils.hasRole('Student'),
  
  // Check if user is faculty or admin
  isFacultyOrAdmin: () => {
    const role = userUtils.getUserRole();
    return role === 'Faculty' || role === 'Admin';
  }
};

// Authentication state utilities
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return tokenUtils.isTokenValid() && userUtils.getUser() !== null;
  },
  
  // Logout user
  logout: () => {
    tokenUtils.removeToken();
    userUtils.removeUser();
    window.location.href = '/login';
  },
  
  // Get user display name
  getUserDisplayName: () => {
    const user = userUtils.getUser();
    return user ? user.name : 'User';
  },
  
  // Get user email
  getUserEmail: () => {
    const user = userUtils.getUser();
    return user ? user.email : '';
  }
};

// Role-based access control
export const roleUtils = {
  // Check if user can access student features
  canAccessStudentFeatures: () => {
    const role = userUtils.getUserRole();
    return role === 'Student' || role === 'Faculty' || role === 'Admin';
  },
  
  // Check if user can access faculty features
  canAccessFacultyFeatures: () => {
    const role = userUtils.getUserRole();
    return role === 'Faculty' || role === 'Admin';
  },
  
  // Check if user can access admin features
  canAccessAdminFeatures: () => {
    return userUtils.isAdmin();
  },
  
  // Get role display name
  getRoleDisplayName: (role) => {
    const roleMap = {
      'Student': 'Student',
      'Faculty': 'Faculty',
      'Admin': 'Administrator'
    };
    return roleMap[role] || role;
  }
};

// Local storage utilities
export const storageUtils = {
  // Clear all auth-related data
  clearAuthData: () => {
    tokenUtils.removeToken();
    userUtils.removeUser();
  },
  
  // Save auth data after login
  saveAuthData: (token, user) => {
    tokenUtils.setToken(token);
    userUtils.setUser(user);
  }
};

export default {
  tokenUtils,
  userUtils,
  authUtils,
  roleUtils,
  storageUtils
};

