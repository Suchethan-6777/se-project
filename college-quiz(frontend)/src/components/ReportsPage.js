// src/components/ReportsPage.js
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "../App.css";

const ReportsPage = () => {
  const [stats, setStats] = useState({
    totalStudents: 120,
    totalFaculty: 15,
    totalQuizzes: 35,
    attempted: 80,
    notAttempted: 40,
  });

  useEffect(() => {
    // Here you’d fetch real report data from backend
  }, []);

  const pieData = [
    { name: "Attempted", value: stats.attempted },
    { name: "Not Attempted", value: stats.notAttempted },
  ];

  const COLORS = ["#28a745", "#dc3545"];

  return (
    <div>
      <Navbar studentName="Admin Panel" />
      <div className="reports-container">
        <BackButton />
        <h2>📊 System Reports</h2>

        <div className="report-cards">
          <div className="report-card">👩‍🎓 Total Students: {stats.totalStudents}</div>
          <div className="report-card">👨‍🏫 Total Faculty: {stats.totalFaculty}</div>
          <div className="report-card">📘 Total Quizzes: {stats.totalQuizzes}</div>
        </div>

        <div className="chart-section">
          <h3>Quiz Attempts Overview</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
