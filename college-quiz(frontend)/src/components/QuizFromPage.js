// src/components/QuizFormPage.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../App.css";

const QuizFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingQuiz = location.state?.quiz || null;

  // Quiz details state
  const [quiz, setQuiz] = useState(
    existingQuiz || { title: "", time: 10, marks: 10, questions: [] }
  );

  // Temporary new question
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    answer: "",
  });

  // Handle quiz detail changes
  const handleQuizChange = (e) => {
    setQuiz({ ...quiz, [e.target.name]: e.target.value });
  };

  // Handle question input change
  const handleQuestionChange = (e) => {
    setNewQuestion({ ...newQuestion, [e.target.name]: e.target.value });
  };

  // Handle option change
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  // Add question to quiz
  const handleAddQuestion = () => {
    if (!newQuestion.question || !newQuestion.answer) return;
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
    setNewQuestion({ question: "", options: ["", "", "", ""], answer: "" });
  };

  // Save quiz
  const handleSaveQuiz = () => {
    console.log("Quiz saved:", quiz); // replace with API later
    navigate("/faculty-dashboard");
  };

  return (
    <div>
      <Navbar studentName="Dr. Smith" />
      <div className="quizform-container">
        <BackButton />

        <h2>{existingQuiz ? "Edit Quiz" : "Create New Quiz"}</h2>

        {/* Quiz Details */}
        <div className="quiz-details">
          <label>Quiz Title:</label>
          <input
            type="text"
            name="title"
            value={quiz.title}
            onChange={handleQuizChange}
          />

          <label>Time (minutes):</label>
          <input
            type="number"
            name="time"
            value={quiz.time}
            onChange={handleQuizChange}
          />

          <label>Total Marks:</label>
          <input
            type="number"
            name="marks"
            value={quiz.marks}
            onChange={handleQuizChange}
          />
        </div>

        {/* Add Question */}
        <div className="question-form">
          <h3>Add Question</h3>
          <label>Question:</label>
          <input
            type="text"
            name="question"
            value={newQuestion.question}
            onChange={handleQuestionChange}
          />

          <div className="options-inputs">
            {newQuestion.options.map((opt, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Option ${index + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
            ))}
          </div>

          <label>Correct Answer:</label>
          <input
            type="text"
            name="answer"
            value={newQuestion.answer}
            onChange={handleQuestionChange}
          />

          <button onClick={handleAddQuestion} className="add-question-btn">
            ➕ Add Question
          </button>
        </div>

        {/* Question Preview */}
        {quiz.questions.length > 0 && (
          <div className="preview-section">
            <h3>Preview Questions</h3>
            <ul>
              {quiz.questions.map((q, i) => (
                <li key={i}>
                  <strong>Q{i + 1}:</strong> {q.question}  
                  <br />
                  Options: {q.options.join(", ")}  
                  <br />
                  ✅ Answer: {q.answer}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={handleSaveQuiz} className="save-btn">
          💾 Save Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizFormPage;
