import React from "react";

export default function Spinner({ size = 28 }) {
  const border = Math.max(3, Math.round(size / 8));
  return (
    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: size,
          height: size,
          border: `${border}px solid #e5e7eb`,
          borderTop: `${border}px solid #2563eb`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}


