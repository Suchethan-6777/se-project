// src/components/StudentPerformancePage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../App.css";

const StudentPerformancePage = () => {
  const { quizId } = useParams();
  const [performance, setPerformance] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");

  useEffect(() => {
    // Dummy data (replace with API call)
    setQuizTitle("Math Quiz");
    setPerformance([
      { id: 1, name: "Alice", score: 45, total: 50, date: "2025-09-10" },
      { id: 2, name: "Bob", score: 30, total: 50, date: "2025-09-10" },
      { id: 3, name: "Charlie", score: 20, total: 50, date: "2025-09-11" },
    ]);
  }, [quizId]);

  return (
    <div>
      <Navbar studentName="Dr. Smith" />
      <div className="performance-container">
        <BackButton />
        <h2>Student Performance - {quizTitle}</h2>

        {performance.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <table className="performance-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Score</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    {p.score} / {p.total}
                  </td>
                  <td>
                    {p.score >= p.total * 0.4 ? (
                      <span className="pass">Pass ✅</span>
                    ) : (
                      <span className="fail">Fail ❌</span>
                    )}
                  </td>
                  <td>{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentPerformancePage;
