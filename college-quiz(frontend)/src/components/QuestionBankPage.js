// src/components/QuestionBankPage.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../App.css";

const QuestionBankPage = () => {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["Berlin", "Paris", "Madrid", "Rome"],
      answer: "Paris",
    },
    {
      id: 2,
      question: "2 + 2 = ?",
      options: ["3", "4", "5", "6"],
      answer: "4",
    },
  ]);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    answer: "",
  });

  const [editingId, setEditingId] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    setNewQuestion({ ...newQuestion, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const updated = [...newQuestion.options];
    updated[index] = value;
    setNewQuestion({ ...newQuestion, options: updated });
  };

  // Add or Update Question
  const handleSave = () => {
    if (!newQuestion.question || !newQuestion.answer) return;

    if (editingId) {
      setQuestions(
        questions.map((q) =>
          q.id === editingId ? { ...newQuestion, id: editingId } : q
        )
      );
      setEditingId(null);
    } else {
      setQuestions([
        ...questions,
        { ...newQuestion, id: Date.now() }, // unique ID
      ]);
    }

    setNewQuestion({ question: "", options: ["", "", "", ""], answer: "" });
  };

  const handleEdit = (q) => {
    setNewQuestion(q);
    setEditingId(q.id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this question?")) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  return (
    <div>
      <Navbar studentName="Dr. Smith" />
      <div className="questionbank-container">
        <BackButton />
        <h2>Question Bank</h2>

        {/* Add/Edit Form */}
        <div className="question-form">
          <label>Question:</label>
          <input
            type="text"
            name="question"
            value={newQuestion.question}
            onChange={handleChange}
          />

          <div className="options-inputs">
            {newQuestion.options.map((opt, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
              />
            ))}
          </div>

          <label>Correct Answer:</label>
          <input
            type="text"
            name="answer"
            value={newQuestion.answer}
            onChange={handleChange}
          />

          <button className="add-question-btn" onClick={handleSave}>
            {editingId ? "✏ Update Question" : "➕ Add Question"}
          </button>
        </div>

        {/* List of Questions */}
        <div className="question-list">
          <h3>Saved Questions</h3>
          {questions.length === 0 ? (
            <p>No questions added yet.</p>
          ) : (
            <ul>
              {questions.map((q) => (
                <li key={q.id} className="question-item">
                  <strong>{q.question}</strong>
                  <br />
                  Options: {q.options.join(", ")}
                  <br />
                  ✅ Answer: {q.answer}
                  <br />
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(q)}
                  >
                    ✏ Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(q.id)}
                  >
                    🗑 Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBankPage;
