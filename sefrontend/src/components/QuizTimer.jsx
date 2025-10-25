import React, { useState, useEffect } from 'react';

const QuizTimer = ({ startTime, endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // This function calculates and sets the time
    const updateTimer = () => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      const timeToStart = start - now;
      const timeToEnd = end - now;

      if (timeToStart > 0) {
        // --- Quiz Hasn't Started Yet ---
        const days = Math.floor(timeToStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeToStart % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeToStart % (1000 * 60)) / 1000);

        // Show a more detailed countdown as it gets closer
        if (days > 0) {
          setTimeLeft(`Starts in: ${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeLeft(`Starts in: ${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setTimeLeft(`Starts in: ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`Starts in: ${seconds}s`);
        }
        setIsActive(false);

      } else if (timeToEnd > 0) {
        // --- Quiz is Active ---
        const totalSeconds = Math.floor(timeToEnd / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Format as HH:MM:SS or MM:SS
        const timeString = `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setTimeLeft(`Time left: ${timeString}`);
        setIsActive(true);

      } else {
        // --- Quiz Has Expired ---
        setTimeLeft('Expired');
        setIsActive(false);
      }
    };

    updateTimer(); // Run once immediately on load
    const timer = setInterval(updateTimer, 1000); // Update every second

    // Clean up the interval when the component unmounts
    return () => clearInterval(timer);
  }, [startTime, endTime]); // Re-run effect if props change

  return (
    // ✅ FIXED: className is now a template literal
    <div className={`text-sm ${isActive ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
      {timeLeft}
    </div>
  );
};

export default QuizTimer;
