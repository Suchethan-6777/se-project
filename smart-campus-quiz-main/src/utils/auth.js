import { jwtDecode } from 'jwt-decode';
import api from './api';

export const saveUserData = (token) => {
  localStorage.setItem('token', token);
};

export const fetchAndSaveUser = async () => {
  try {
    const response = await api.get('/auth/me');
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const clearUserData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const logout = () => {
  clearUserData();
  window.location.href = '/login';
};
