import React from "react";
import "./EventCard.css";

export default function EventCard({ event }) {
  return (
    <>
      <div className="eventCard_container">
        <div className="eventCard_header">
          <p>general</p>
          <h1>GBM</h1>
        </div>
        <div className="eventCard_body">
          <h1>General Body Meeting</h1>
          <h2>02/18/22</h2>
        </div>
        <div className="eventCard_progressContainer">
          <div className="eventCard_progressBar"></div>
        </div>
      </div>
      <div className="eventCard_container">
        <div className="eventCard_header">
          <p>general</p>
          <h1>GBM</h1>
        </div>
        <div className="eventCard_body">
          <h1>General Body Meeting Longer</h1>
          <h2>02/18/22</h2>
        </div>
        <div className="eventCard_progressContainer">
          <div className="eventCard_progressBar"></div>
        </div>
      </div>
    </>


  );
}