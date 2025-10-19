import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <h1 style={{ fontSize: 56, marginBottom: 8 }}>404</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>The page you requested was not found.</p>
      <button className="btn btn-primary" onClick={() => navigate("/")}>Go Home</button>
    </div>
  );
}


