// src/components/StudentDashboard.js
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import QuizCard from "./QuizCard";
import PerformanceChart from "./PerformanceChart";
import Notifications from "./Notifications";
import BackButton from "./BackButton";  // ⬅ Back button
import "../App.css";

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [studentName] = useState("John Doe");

  useEffect(() => {
    // Dummy quiz data (replace with API later)
    setQuizzes([
      { id: 1, title: "Math Quiz", status: "Not Attempted" },
      { id: 2, title: "Science Quiz", status: "Attempted" },
      { id: 3, title: "History Quiz", status: "Not Attempted" },
      { id: 4, title: "English Quiz", status: "Attempted" },
    ]);
  }, []);

  return (
    <div>
      {/* Top Navbar */}
      <Navbar studentName={studentName} />

      {/* Main Dashboard Container */}
      <div className="dashboard-container">
        
        {/* Left Section - Quizzes */}
        <div className="quiz-section">
          <BackButton />   {/* ⬅ Back to previous page */}
          <h2>Available Quizzes</h2>
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>

        {/* Right Section - Performance & Notifications */}
        <div className="performance-section">
          <h2>Performance Overview</h2>
          <PerformanceChart />

          <h2>Notifications</h2>
          <Notifications />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
