// src/utils/auth.js
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("quizUser") || sessionStorage.getItem("quizUser");
    return raw ? JSON.parse(raw) : null;
  } catch (_e) {
    return null;
  }
};

export const saveUser = (user, persist = false) => {
  const payload = JSON.stringify(user);
  if (persist) localStorage.setItem("quizUser", payload);
  else sessionStorage.setItem("quizUser", payload);
};

export const clearUser = () => {
  localStorage.removeItem("quizUser");
  sessionStorage.removeItem("quizUser");
};

export const navigateByRole = (navigate, role) => {
  if (role === "student") navigate("/student-dashboard");
  else if (role === "faculty") navigate("/faculty-dashboard");
  else navigate("/admin-dashboard");
};

export const getRoleHomePath = (role) => {
  if (role === "student") return "/student-dashboard";
  if (role === "faculty") return "/faculty-dashboard";
  return "/admin-dashboard";
};


