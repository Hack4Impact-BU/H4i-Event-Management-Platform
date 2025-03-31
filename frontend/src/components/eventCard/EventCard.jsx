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
  const progressPercent = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  // Utility to get acronym from title.
  const getAcronym = (title) => {
    if (!title) return "";
    return title
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Format date in MM/DD/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    // Check if it's a Date object
    if (dateStr instanceof Date && typeof dateStr.getTime === 'function') {
      const month = (dateStr.getMonth() + 1).toString().padStart(2, '0');
      const day = dateStr.getDate().toString().padStart(2, '0');
      const year = dateStr.getFullYear();
      return `${month}/${day}/${year}`;
    }

    // Handle string date format (assuming YYYY-MM-DD from the backend)
    if (typeof dateStr === 'string') {
      // Split the date string and rearrange components
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // parts[0] is year, parts[1] is month, parts[2] is day
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
      }
    }

    // Return the original value if format is unknown
    return dateStr;
  };

  const eventDate = event.dateTime ? new Date(event.dateTime) : event.date;

  return (
    <div className="eventCard_container">
      <div className="eventCard_header">
        <p style={{ backgroundColor: event.tagColor || "#C2E2C7" }}>
          {event.tag || "general"}
        </p>
        <h1>{getAcronym(event.title)}</h1>
      </div>
      <div className="eventCard_body">
        <h1>{event.title}</h1>
        <h2>{formatDate(eventDate)}</h2>
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
