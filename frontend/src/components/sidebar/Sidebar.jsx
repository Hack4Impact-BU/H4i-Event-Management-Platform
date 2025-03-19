import React, { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import Tasks from "../task/Tasks";
import "./Sidebar.css";

const Sidebar = ({ selectedEvent, closeSidebar }) => {
  const [predictedBudget, setPredictedBudget] = useState("");
  const [actualSpent, setActualSpent] = useState("");
  const [attendance, setAttendance] = useState("");
  const [net, setNet] = useState(predictedBudget - actualSpent);

  // When the selectedEvent changes, update the state values
  useEffect(() => {
    if (selectedEvent) {
      setPredictedBudget(selectedEvent.budget.predicted || "");
      setActualSpent(selectedEvent.budget.actual || "");
      setAttendance(selectedEvent.attendance || "");
    }
  }, [selectedEvent]);

  // calls updateEvent when the predictedBudget, actualSpent, or attendance changes
  useEffect(() => {
    if (selectedEvent) {
      updateEvent();
    }
  }, [predictedBudget, actualSpent, attendance]);

  const updateEvent = async () => {
    console.log('updating event');
    try { 
      const response = await fetch("http://localhost:3000/updateEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: selectedEvent._id,
          budget: {
            predicted: predictedBudget,
            actual: actualSpent,
          },
          attendance: attendance,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update event");
      }
      const data = await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }

  const sendInvite = async () => {
    try {
      console.log("sending invite");
      const response = await fetch ("http://localhost:3000/sendInvite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          'summary': selectedEvent.title,
          'location': selectedEvent.location,
          'description': selectedEvent.description,
          'start': {
            'dateTime': `${selectedEvent.date}T${selectedEvent.time.start}:00-05:00`,
            'timeZone': 'America/New_York'
          },
          'end': {
            'dateTime': `${selectedEvent.date}T${selectedEvent.time.end}:00-05:00`,
            'timeZone': 'America/New_York'
          },
        })
      });
      if (!response.ok) {
        throw new Error("Failed to send calendar invite");
      }

    } catch (error) {
      console.log('Error sending invite:', error);
    }
  }

  useEffect(() => {
    setNet(predictedBudget - actualSpent);
  }, [predictedBudget, actualSpent]);



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
            <IconButton id="iconButton" onClick={sendInvite}>
              <EventOutlinedIcon id="calendarButton"/>
            </IconButton>
          </h2>
          <h2 className="sidebar_subtitle">{selectedEvent.location}</h2>
          <p>{selectedEvent.description}</p>
          <div className="sidebar_tasks">
            {selectedEvent.tasks.map((task) => (
              <Tasks key={task._id} task={task} />
            ))}
          </div>
          <div className="sidebar_budget">
            <h2 className="sidebar_subtitle">Logistics</h2>
            <div className="budget_item">
              <label htmlFor="predictedBudget">Budget </label>
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
              <label htmlFor="attendance">Net </label>
              <p className='budget_net'
                style={{ color: net < 0 ? "red" : "green" }}>
                {net}
              </p>
            </div>
            <div className="budget_item">
              <label htmlFor="attendance">Attendance </label>
              <input
                id="attendance"
                type="number"
                value={selectedEvent.attendance}
                onChange={(e) => setAttendance(e.target.value)}
              />
            </div>
          </div>
          <div className="sidebar_links">
            <h2 className="sidebar_subtitle">Files</h2>
            {selectedEvent.links.map((link, index) => (
              <a key={index} href={link} target="_blank" rel="noreferrer">
                {link}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;