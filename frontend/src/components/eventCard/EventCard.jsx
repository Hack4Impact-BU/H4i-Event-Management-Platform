import React from "react";
import "./EventCard.css";

export default function EventCard({ event }) {
  // Calculate the total points and points earned based on tasks statuses.
  const totalPoints = event.tasks.length * 2;
  const earnedPoints = event.tasks.reduce((acc, task) => {
    if (task.status === "Done") return acc + 2;
    if (task.status === "In Progress") return acc + 1;
    return acc;
  }, 0);
  const progressPercent = (earnedPoints / totalPoints) * 100;

  // Utility to get acronym from title.
  const getAcronym = (title) => {
    if (!title) return "";
    return title
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  const eventDate = event.dateTime ? new Date(event.dateTime) : event.date;

  return (
    <div className="eventCard_container">
      <div className="eventCard_header">
        <p>{event.tags && event.tags.length ? event.tags.join(', ') : "general"}</p>
        <h1>{getAcronym(event.title)}</h1>
      </div>
      <div className="eventCard_body">
        <h1>{event.title}</h1>
        <h2>
          {eventDate instanceof Date && typeof eventDate.getTime === 'function'
            ? eventDate.toLocaleDateString()
            : eventDate}
        </h2>
      </div>
      <div className="eventCard_progressContainer">
        <div
          className="eventCard_progressBar"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
}
