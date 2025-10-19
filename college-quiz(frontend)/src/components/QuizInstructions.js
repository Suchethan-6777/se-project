// src/components/QuizInstructions.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../App.css";

const QuizInstructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const quiz = location.state?.quiz || { 
    title: "Unknown Quiz", 
    time: 0, 
    marks: 0 
  };

  const handleStartQuiz = () => {
    navigate("/quiz-taking", { state: { quiz } });
  };

  return (
    <div>
      <Navbar studentName="John Doe" />
      <div className="instructions-container">
        <BackButton />

        <h2>{quiz.title} - Instructions</h2>
        <p><strong>Time Limit:</strong> {quiz.time} minutes</p>
        <p><strong>Total Marks:</strong> {quiz.marks}</p>

        <h3>Please read the instructions carefully:</h3>
        <ul>
          <li>Each question carries equal marks.</li>
          <li>There is no negative marking.</li>
          <li>You cannot go back once the quiz has started.</li>
          <li>Do not refresh or close the tab during the quiz.</li>
          <li>Your answers will be auto-submitted once time is up.</li>
        </ul>

        <button className="start-button" onClick={handleStartQuiz}>
          🚀 Start Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizInstructions;
