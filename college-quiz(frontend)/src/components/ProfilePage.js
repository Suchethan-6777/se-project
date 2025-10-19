// src/components/ProfilePage.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../App.css";

const ProfilePage = () => {
  const [student, setStudent] = useState({
    name: "John Doe",
    rollNo: "22CS1001",
    email: "john.doe@nitrw.ac.in",
    branch: "Computer Science",
    year: "2nd Year",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState(student);

  const handleChange = (e) => {
    setTempData({ ...tempData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setStudent(tempData);
    setIsEditing(false);
  };

  return (
    <div>
      <Navbar studentName={student.name} />

      <div className="profile-container">
        <BackButton />

        <h2>Student Profile</h2>
        <div className="profile-card">
          <img
            src="https://via.placeholder.com/120"
            alt="Profile"
            className="profile-pic"
          />

          {!isEditing ? (
            <div className="profile-details">
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Roll No:</strong> {student.rollNo}</p>
              <p><strong>Email:</strong> {student.email}</p>
              <p><strong>Branch:</strong> {student.branch}</p>
              <p><strong>Year:</strong> {student.year}</p>
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                ✏ Edit Profile
              </button>
            </div>
          ) : (
            <div className="edit-form">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={tempData.name}
                onChange={handleChange}
              />
              <label>Roll No:</label>
              <input
                type="text"
                name="rollNo"
                value={tempData.rollNo}
                onChange={handleChange}
              />
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={tempData.email}
                onChange={handleChange}
              />
              <label>Branch:</label>
              <input
                type="text"
                name="branch"
                value={tempData.branch}
                onChange={handleChange}
              />
              <label>Year:</label>
              <input
                type="text"
                name="year"
                value={tempData.year}
                onChange={handleChange}
              />

              <div className="edit-buttons">
                <button onClick={handleSave} className="save-btn">
                  ✅ Save
                </button>
                <button onClick={() => setIsEditing(false)} className="cancel-btn">
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
