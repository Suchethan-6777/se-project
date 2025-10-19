// src/components/Navbar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser, clearUser } from "../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearUser();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div style={styles.logo}>📘 College Quiz</div>
      <div className="nav-right">
        {user && (
          <>
            <span style={styles.userInfo}>
              {user.email} ({user.role})
            </span>
            <button className="btn btn-ghost" onClick={() => navigate("/student-profile")}>
              Profile
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  logo: {
    fontWeight: "bold",
    fontSize: "18px",
  },
  userInfo: {
    marginRight: "15px",
    fontSize: "14px",
  },
};

export default Navbar;
