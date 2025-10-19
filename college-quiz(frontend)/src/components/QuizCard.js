// src/components/QuizSelectionCard.js
import React from "react";

const QuizSelectionCard = ({ quiz }) => {
  return (
    <div className="quiz-selection-card">
      <h3>{quiz.title}</h3>
      <p>Time Limit: {quiz.time} mins</p>
      <p>Total Marks: {quiz.marks}</p>
      <p>Status: {quiz.status}</p>
      <button>
        {quiz.status === "Not Attempted" ? "Start Quiz" : "View Result"}
      </button>
    </div>
  );
};

export default QuizSelectionCard;
