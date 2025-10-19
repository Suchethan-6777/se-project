import React from "react";

const Notifications = () => {
  const dummyNotifications = [
    "New quiz on Science is available.",
    "Your Math quiz results are published.",
    "College Quiz system maintenance on Sunday.",
  ];

  return (
    <div className="notifications">
      <ul>
        {dummyNotifications.map((note, index) => (
          <li key={index}>{note}</li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
