// src/components/QuizTakingPage.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../App.css";

const QuizTakingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const quiz = location.state?.quiz || { title: "Quiz", time: 10 };

  // Dummy questions (replace with API later)
  const questions = [
    {
      id: 1,
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: "4"
    },
    {
      id: 2,
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Venus", "Mars", "Jupiter"],
      answer: "Mars"
    },
    {
      id: 3,
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "J.K. Rowling", "Tolstoy"],
      answer: "William Shakespeare"
    }
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.time * 60); // in seconds

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Save answer
  const handleOptionSelect = (option) => {
    setAnswers({ ...answers, [questions[currentQ].id]: option });
  };

  // Navigation
  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  // Submit Quiz
  const handleSubmit = () => {
    navigate("/quiz-result", { state: { quiz, answers, questions } });
  };

  // Format time
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <div>
      <Navbar studentName="John Doe" />
      <div className="quiz-taking-container">
        <BackButton />

        <div className="quiz-header">
          <h2>{quiz.title}</h2>
          <p>⏱ Time Left: {formatTime(timeLeft)}</p>
        </div>

        <div className="question-box">
          <h3>
            Q{currentQ + 1}. {questions[currentQ].question}
          </h3>
          <div className="options">
            {questions[currentQ].options.map((opt, idx) => (
              <label key={idx} className="option-label">
                <input
                  type="radio"
                  name={`q${questions[currentQ].id}`}
                  value={opt}
                  checked={answers[questions[currentQ].id] === opt}
                  onChange={() => handleOptionSelect(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button onClick={handlePrev} disabled={currentQ === 0}>
            ⬅ Previous
          </button>
          {currentQ < questions.length - 1 ? (
            <button onClick={handleNext}>Next ➡</button>
          ) : (
            <button onClick={handleSubmit} className="submit-btn">
              ✅ Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTakingPage;
