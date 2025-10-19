// src/components/Topbar.js
import React from 'react';

export default function Topbar({ language, setLanguage }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Replace text with college logo image if you have one */}
        <div className="logo">NITW Portal</div>
      </div>

      <div className="topbar-right">
        <select
          className="lang-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Select language"
        >
          <option value="english">English</option>
          <option value="hindi">हिन्दी</option>
          <option value="telugu">తెలుగు</option>
        </select>
      </div>
    </header>
  );
}
