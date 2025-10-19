// src/components/QuizListPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../App.css";

const QuizListPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    // Dummy quiz data (replace with API later)
    setQuizzes([
      { id: 1, title: "Math Quiz", time: 20, marks: 50 },
      { id: 2, title: "Science Quiz", time: 30, marks: 40 },
      { id: 3, title: "History Quiz", time: 15, marks: 30 },
    ]);
  }, []);

  const handleEdit = (quiz) => {
    navigate("/quiz-form", { state: { quiz } });
  };

  const handleDelete = (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      setQuizzes(quizzes.filter((q) => q.id !== quizId));
    }
  };

  const handleViewSubmissions = (quizId) => {
    navigate(`/quiz/${quizId}/submissions`);
  };

  return (
    <div>
      <Navbar studentName="Dr. Smith" />
      <div className="quizlist-container">
        <BackButton />
        <h2>All Quizzes</h2>

        {quizzes.length === 0 ? (
          <p>No quizzes available.</p>
        ) : (
          <table className="quiz-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Time (min)</th>
                <th>Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td>{quiz.title}</td>
                  <td>{quiz.time}</td>
                  <td>{quiz.marks}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(quiz)}
                    >
                      ✏ Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(quiz.id)}
                    >
                      🗑 Delete
                    </button>
                    <button
                      className="view-btn"
                      onClick={() => handleViewSubmissions(quiz.id)}
                    >
                      📊 View Submissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default QuizListPage;
