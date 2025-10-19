import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import QuizSelectionCard from "./QuizSelectionCard";
import BackButton from "./BackButton";   // ⬅ Import
import "../App.css";

const QuizSelectionPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [studentName] = useState("John Doe");

  useEffect(() => {
    setQuizzes([
      { id: 1, title: "Math Quiz", time: 15, marks: 50, status: "Not Attempted" },
      { id: 2, title: "Science Quiz", time: 20, marks: 60, status: "Attempted" },
      { id: 3, title: "History Quiz", time: 10, marks: 40, status: "Not Attempted" },
      { id: 4, title: "English Quiz", time: 25, marks: 70, status: "Attempted" },
    ]);
  }, []);

  return (
    <div>
      <Navbar studentName={studentName} />
      <div className="quiz-selection-container">
        <BackButton />   {/* ⬅ Back Button added here */}
        <h2>Select a Quiz</h2>
        <div className="quiz-list">
          {quizzes.map((quiz) => (
            <QuizSelectionCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizSelectionPage;
