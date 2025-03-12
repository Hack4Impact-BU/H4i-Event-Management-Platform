import React, { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./Sidebar.css";
import Tasks from "../task/Tasks";

const Sidebar = ({ selectedEvent, closeSidebar, onUpdateEvent }) => {
  // Local copy of the event including tasks.
  const [eventData, setEventData] = useState(selectedEvent);
  // State for logistics.
  const [predictedBudget, setPredictedBudget] = useState("");
  const [actualSpent, setActualSpent] = useState("");
  const [attendance, setAttendance] = useState("");
  const [net, setNet] = useState(0);

  // When selectedEvent changes, update local event data and logistics fields.
  useEffect(() => {
    if (selectedEvent) {
      setEventData(selectedEvent);
      setPredictedBudget(selectedEvent.budget.predicted);
      setActualSpent(selectedEvent.budget.actual);
      setAttendance(selectedEvent.attendance);
    }
  }, [selectedEvent]);

  // Update net when budget values change.
  useEffect(() => {
    setNet(predictedBudget - actualSpent);
  }, [predictedBudget, actualSpent]);

  // Update the event on logistics changes.
  useEffect(() => {
    if (eventData) {
      updateEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictedBudget, actualSpent, attendance]);

  // Function to update the event on the backend.
  const updateEvent = async () => {
    try {
      const response = await fetch("http://localhost:3000/updateEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: eventData._id,
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
      console.log(data);
      setEventData(data);
      if (onUpdateEvent) {
        onUpdateEvent(data);
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  // Callback to update the status of a specific task.
  const handleTaskStatusChange = (taskId, newStatus) => {
    const updatedTasks = eventData.tasks.map((task) =>
      task._id === taskId ? { ...task, status: newStatus } : task
    );
    const updatedEventData = { ...eventData, tasks: updatedTasks };
    setEventData(updatedEventData);
    // Inform the parent (Home) about the change so that EventCard re-renders.
    if (onUpdateEvent) {
      onUpdateEvent(updatedEventData);
    }
  };

  return (
    <div className={`home_sidebarContainer ${selectedEvent ? "open" : ""}`}>
      <IconButton id="iconButton" onClick={closeSidebar}>
        <CloseIcon id="closeButton" />
      </IconButton>
      {eventData && (
        <div className="sidebar_content">
          <h1 className="sidebar_title">{eventData.title}</h1>
          <h2 className="sidebar_subtitle">
            {eventData.date} {eventData.time.start}-{eventData.time.end}
          </h2>
          <h2 className="sidebar_subtitle">{eventData.location}</h2>
          <p>{eventData.description}</p>
          <div className="sidebar_tasks">
            {eventData.tasks.map((task) => (
              <Tasks
                key={task._id}
                task={task}
                onStatusChange={handleTaskStatusChange}
              />
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
                onChange={(e) =>
                  setPredictedBudget(Number(e.target.value))
                }
              />
            </div>
            <div className="budget_item">
              <label htmlFor="actualSpent">Actual Spent </label>
              <input
                id="actualSpent"
                type="number"
                value={actualSpent}
                onChange={(e) =>
                  setActualSpent(Number(e.target.value))
                }
              />
            </div>
            <div className="budget_item">
              <label htmlFor="net">Net </label>
              <p className="budget_net" style={{ color: net < 0 ? "red" : "green" }}>
                {net}
              </p>
            </div>
            <div className="budget_item">
              <label htmlFor="attendance">Attendance </label>
              <input
                id="attendance"
                type="number"
                value={attendance}
                onChange={(e) =>
                  setAttendance(Number(e.target.value))
                }
              />
            </div>
          </div>
          <div className="sidebar_links">
            <h2 className="sidebar_subtitle">Files</h2>
            {eventData.links.map((link, index) => (
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
