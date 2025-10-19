// src/components/NotificationsPage.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../App.css";

const NotificationsPage = () => {
  const [announcements, setAnnouncements] = useState([
    { id: 1, message: "Midterm exams will be conducted next week!", date: "2025-09-10" },
    { id: 2, message: "New quizzes have been uploaded by faculty.", date: "2025-09-12" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleAdd = () => {
    if (newMessage.trim() === "") return;
    const newAnnouncement = {
      id: announcements.length + 1,
      message: newMessage,
      date: new Date().toISOString().split("T")[0],
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setNewMessage("");
  };

  return (
    <div>
      <Navbar studentName="Admin Panel" />
      <div className="notifications-container">
        <BackButton />
        <h2>📢 Announcements</h2>

        <div className="add-announcement">
          <input
            type="text"
            placeholder="Enter announcement..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleAdd}>➕ Add</button>
        </div>

        <ul className="announcement-list">
          {announcements.map((a) => (
            <li key={a.id}>
              <span className="date">{a.date}:</span> {a.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsPage;
