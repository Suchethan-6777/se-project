import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const dummyData = [
  { quiz: "Math", score: 85 },
  { quiz: "Science", score: 90 },
  { quiz: "History", score: 70 },
  { quiz: "English", score: 95 },
];

const PerformanceChart = () => {
  return (
    <div style={{ width: "100%", height: 300, marginTop: "1rem" }}>
      <ResponsiveContainer>
        <LineChart data={dummyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="quiz" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#1f3942" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
