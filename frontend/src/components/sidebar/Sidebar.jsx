import React, { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./Sidebar.css";
import Tasks from "../task/Tasks";

const Sidebar = ({ selectedEvent, closeSidebar }) => {
  const [predictedBudget, setPredictedBudget] = useState("");
  const [actualSpent, setActualSpent] = useState("");
  const [attendance, setAttendance] = useState("");

  // When the selectedEvent changes, update the state values
  useEffect(() => {
    if (selectedEvent) {
      setPredictedBudget(selectedEvent.budget.predicted);
      setActualSpent(selectedEvent.budget.actual);
      setAttendance(selectedEvent.attendance);
    }
  }, [selectedEvent]);

  return (
    <div className={`home_sidebarContainer ${selectedEvent ? "open" : ""}`}>
      <IconButton id="iconButton" onClick={closeSidebar}>
        <CloseIcon id="closeButton" />
      </IconButton>
      {selectedEvent && (
        <div className="sidebar_content">
          <h1 className="sidebar_title">{selectedEvent.title}</h1>
          <h2 className="sidebar_subtitle">
            {selectedEvent.date} {selectedEvent.time.start} - {selectedEvent.time.end}
          </h2>
          <h2 className="sidebar_subtitle">{selectedEvent.location}</h2>
          <p>{selectedEvent.description}</p>
          <div className="sidebar_tasks">
            {selectedEvent.tasks.map((task) => (
              <Tasks key={task._id} task={task} />
            ))}
          </div>
          <div className="sidebar_links">
            <h2 className="sidebar_subtitle">Links:</h2>
            {selectedEvent.links.map((link, index) => (
              <a key={index} href={link} target="_blank" rel="noreferrer">
                {link}
              </a>
            ))}
          </div>
          <div className="sidebar_budget">
            <h2 className="sidebar_subtitle">Post Event Check-In</h2>
            <div className="budget_item">
              <label htmlFor="predictedBudget">Predicted Budget </label>
              <input
                id="predictedBudget"
                type="number"
                value={predictedBudget}
                onChange={(e) => setPredictedBudget(e.target.value)}
              />
            </div>
            <div className="budget_item">
              <label htmlFor="actualSpent">Actual Spent </label>
              <input
                id="actualSpent"
                type="number"
                value={actualSpent}
                onChange={(e) => setActualSpent(e.target.value)}
              />
            </div>
            <div className="budget_item">
              <label htmlFor="attendance">Attendance </label>
              <input
                id="attendance"
                type="number"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;