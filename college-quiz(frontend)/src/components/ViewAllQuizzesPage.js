// src/components/ViewAllQuizzesPage.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../App.css";

const ViewAllQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: "Math Quiz",
      subject: "Mathematics",
      createdBy: "Prof. Sharma",
      status: "Active",
    },
    {
      id: 2,
      title: "Science Quiz",
      subject: "Physics",
      createdBy: "Dr. Verma",
      status: "Inactive",
    },
    {
      id: 3,
      title: "History Quiz",
      subject: "History",
      createdBy: "Prof. Mehta",
      status: "Active",
    },
  ]);

  // Delete quiz
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      setQuizzes(quizzes.filter((q) => q.id !== id));
    }
  };

  // Toggle quiz status (Active/Inactive)
  const toggleStatus = (id) => {
    setQuizzes(
      quizzes.map((q) =>
        q.id === id
          ? { ...q, status: q.status === "Active" ? "Inactive" : "Active" }
          : q
      )
    );
  };

  return (
    <div>
      <Navbar studentName="Admin Panel" />
      <div className="quizlist-container">
        <BackButton />
        <h2>📘 All Quizzes</h2>

        <table className="quiz-table">
          <thead>
            <tr>
              <th>Quiz Title</th>
              <th>Subject</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td>{quiz.title}</td>
                <td>{quiz.subject}</td>
                <td>{quiz.createdBy}</td>
                <td>
                  <span
                    className={
                      quiz.status === "Active" ? "status-active" : "status-inactive"
                    }
                  >
                    {quiz.status}
                  </span>
                </td>
                <td>
                  <button
                    className="status-btn"
                    onClick={() => toggleStatus(quiz.id)}
                  >
                    {quiz.status === "Active" ? "🔒 Deactivate" : "✅ Activate"}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(quiz.id)}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAllQuizzesPage;
