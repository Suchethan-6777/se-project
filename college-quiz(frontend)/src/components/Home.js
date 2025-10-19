// src/components/Home.js
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to College Quiz</h1>
      <p className="text-lg md:text-xl mb-8 text-center max-w-xl">
        Test your knowledge and challenge your friends! Get started with the quiz and see how high you can score.
      </p>

      <div className="flex space-x-4">
        <button className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl shadow-lg hover:bg-yellow-300 transition">
          Start Quiz
        </button>
        <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:bg-gray-200 transition">
          View Leaderboard
        </button>
      </div>
    </div>
  );
}
