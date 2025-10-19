// src/components/AdminDashboard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "../App.css";
import { clearUser } from "../utils/auth";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar studentName="Admin Panel" />
      <div className="admin-dashboard-container">
        <h2>Admin Dashboard</h2>
        <div className="admin-cards">
          <div
            className="admin-card"
            onClick={() => navigate("/manage-users")}
          >
            👥 Manage Users
          </div>
          <div
            className="admin-card"
            onClick={() => navigate("/view-all-quizzes")}
          >
            📚 View All Quizzes
          </div>
          <div
            className="admin-card"
            onClick={() => navigate("/system-reports")}
          >
            📊 System Reports
          </div>
          <div
            className="admin-card"
            onClick={() => navigate("/settings")}
          >
            ⚙️ Settings
          </div>
          <div
            className="admin-card"
            onClick={() => navigate("/announcements")}
          >
            🔔 Announcements
          </div>
          <div
            className="admin-card logout"
            onClick={() => {
              clearUser();
              navigate("/");
            }}
          >
            🚪 Logout
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
