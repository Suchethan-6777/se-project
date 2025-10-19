// src/components/BackButton.js
import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        padding: "8px 14px",
        marginBottom: "1rem",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        background: "#6c757d",
        color: "white",
      }}
    >
      ⬅ Back
    </button>
  );
};

export default BackButton;
