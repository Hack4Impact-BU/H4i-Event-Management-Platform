import React from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./Sidebar.css";
import Tasks from "../task/Tasks";

const Sidebar = ({ selectedEvent, closeSidebar }) => {
  return (
    <div className={`home_sidebarContainer ${selectedEvent ? "open" : ""}`}>
      <IconButton id="iconButton" onClick={closeSidebar}>
        <CloseIcon id="closeButton" />
      </IconButton>
      {selectedEvent && (
        <div className="sidebar_content">
            <h1 className="sidebar_title">{selectedEvent.title}</h1>
            <h2 className="sidebar_subtitle">
                {selectedEvent.date} {selectedEvent.time.start}-{selectedEvent.time.end}
            </h2>
            <h2 className="sidebar_subtitle">{selectedEvent.location}</h2>
            <p>{selectedEvent.description}</p>
            <div className="sidebar_tasks">
                {selectedEvent.tasks.map((task) => (
                    <Tasks task={task} />
                ))}
            </div>
            <div className="sidebar_links">
                <h2 className="sidebar_subtitle">Links:</h2>
                {selectedEvent.links.map((link) => (
                    <a href={link} target="_blank" rel="noreferrer">{link}</a>
                ))}
            </div>
            <div className="sidebar_budget">
                <h2 className="sidebar_subtitle">Post Event Check-In</h2>
                <p><strong>Predicted Budget:</strong> ${selectedEvent.budget.predicted}</p>
                <p><strong>Actual Spent:</strong> ${selectedEvent.budget.actual}</p>
                <p><strong>Attendance:</strong> {selectedEvent.attendance} people</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
