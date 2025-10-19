// src/components/SettingsPage.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../App.css";

const SettingsPage = () => {
  const [theme, setTheme] = useState("light");
  const [password, setPassword] = useState("");

  const handleSave = () => {
    alert(`Settings saved!\nTheme: ${theme}\nPassword: ${password ? "Updated" : "Unchanged"}`);
  };

  return (
    <div>
      <Navbar studentName="Admin Panel" />
      <div className="settings-container">
        <BackButton />
        <h2>⚙️ Settings</h2>

        <div className="settings-section">
          <label>Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">🌞 Light</option>
            <option value="dark">🌙 Dark</option>
          </select>
        </div>

        <div className="settings-section">
          <label>Change Password:</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="save-btn" onClick={handleSave}>
          💾 Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
