import React from "react";
import "./EventCard.css";

export default function EventCard({ event }) {
  const eventDate = event.dateTime ? new Date(event.dateTime) : event.date;

  const getAcronym = (title) => {
    if (!title) return "";
    return title
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

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
        <div className="eventCard_progressBar"></div>
      </div>
    </div>
  );
}