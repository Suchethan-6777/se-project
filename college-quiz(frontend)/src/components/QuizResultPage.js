// src/components/QuizResultPage.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "../App.css";

const QuizResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz, answers, questions } = location.state || {};

  if (!quiz || !questions) {
    return <h2>No quiz results available.</h2>;
  }

  // Calculate Score
  const correctCount = questions.filter(
    (q) => answers[q.id] === q.answer
  ).length;
  const totalQuestions = questions.length;
  const score = `${correctCount} / ${totalQuestions}`;

  return (
    <div>
      <Navbar studentName="John Doe" />

      <div className="result-container">
        <h2>{quiz.title} - Results</h2>
        <p><strong>Score:</strong> {score}</p>

        <table className="result-table">
          <thead>
            <tr>
              <th>Q.No</th>
              <th>Question</th>
              <th>Your Answer</th>
              <th>Correct Answer</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, index) => (
              <tr
                key={q.id}
                className={
                  answers[q.id] === q.answer ? "correct-row" : "wrong-row"
                }
              >
                <td>{index + 1}</td>
                <td>{q.question}</td>
                <td>{answers[q.id] || "Not Answered"}</td>
                <td>{q.answer}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          className="back-dashboard"
          onClick={() => navigate("/student-dashboard")}
        >
          ⬅ Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuizResultPage;
