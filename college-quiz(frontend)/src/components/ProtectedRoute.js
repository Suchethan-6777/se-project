// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser, getRoleHomePath } from "../utils/auth";

const ProtectedRoute = ({ role, roles, children }) => {
  const user = getStoredUser();

  if (!user) return <Navigate to="/" replace />;

  const allowedRoles = Array.isArray(roles) && roles.length > 0 ? roles : role ? [role] : [];
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
