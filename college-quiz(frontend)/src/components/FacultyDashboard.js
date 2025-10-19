// src/components/FacultyDashboard.js
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../App.css";

const FacultyDashboard = () => {
  const [facultyName] = useState("Dr. Smith");
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    // Dummy quizzes (replace with backend later)
    setQuizzes([
      { id: 1, title: "Math Quiz", submissions: 25 },
      { id: 2, title: "Science Quiz", submissions: 30 },
      { id: 3, title: "History Quiz", submissions: 18 },
    ]);
  }, []);

  return (
    <div>
      <Navbar studentName={facultyName} /> {/* We can rename prop to userName later */}
      
      <div className="dashboard-container">
        <BackButton />

        {/* Left Section - Manage Quizzes */}
        <div className="quiz-section">
          <h2>My Quizzes</h2>
          <button className="create-btn">➕ Create New Quiz</button>
          <ul className="quiz-list-faculty">
            {quizzes.map((quiz) => (
              <li key={quiz.id} className="quiz-item">
                <span>{quiz.title}</span>
                <span>{quiz.submissions} Submissions</span>
                <div>
                  <button className="edit-btn">✏ Edit</button>
                  <button className="delete-btn">🗑 Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section - Notifications & Results */}
        <div className="performance-section">
          <h2>Post Announcement</h2>
          <textarea
            className="announcement-box"
            placeholder="Write an announcement for students..."
          ></textarea>
          <button className="post-btn">📢 Post</button>

          <h2>Quick Stats</h2>
          <p>Total Quizzes: {quizzes.length}</p>
          <p>Total Submissions: {quizzes.reduce((a, q) => a + q.submissions, 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
