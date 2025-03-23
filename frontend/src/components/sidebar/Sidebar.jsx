import React, { useState, useEffect, useRef } from "react";
import { IconButton, SvgIcon } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AddIcon from "@mui/icons-material/Add";
import TextareaAutosize from "react-textarea-autosize";
import Tasks from "../task/Tasks";
import GoogleCalIcon from "../../assets/google_calendar_icon.svg";
import "./Sidebar.css";

const Sidebar = ({ selectedEvent, closeSidebar, onUpdateEvent }) => {
  // Local copy of the event including tasks.
  const [eventData, setEventData] = useState(selectedEvent);
  // State for logistics.
  const [predictedBudget, setPredictedBudget] = useState("");
  const [actualSpent, setActualSpent] = useState("");
  const [attendance, setAttendance] = useState("");
  const [net, setNet] = useState(0);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

  // Ref to track if update is from user or server
  const isUserAction = useRef(false);
  const pendingUpdate = useRef(false);

  // When selectedEvent changes, update local event data and logistics fields.
  useEffect(() => {
    if (selectedEvent) {
      setEventData(selectedEvent);
      setPredictedBudget(selectedEvent.budget.predicted);
      setActualSpent(selectedEvent.budget.actual);
      setAttendance(selectedEvent.attendance);
      setTitle(selectedEvent.title);
      setDate(selectedEvent.date);
      setStartTime(selectedEvent.time.start);
      setEndTime(selectedEvent.time.end);
      setLocation(selectedEvent.location);
      setDescription(selectedEvent.description);
    }
  }, [selectedEvent]);

  // Update net when budget values change.
  useEffect(() => {
    setNet(predictedBudget - actualSpent);
  }, [predictedBudget, actualSpent]);

  // Update the event on logistics, date/time, or text changes.
  useEffect(() => {
    // Skip initial render and only update if we have real data changes
    if (!eventData || !selectedEvent) return;

    // If this change was triggered by user action
    if (isUserAction.current) {
      pendingUpdate.current = true;
      const timer = setTimeout(() => {
        if (pendingUpdate.current) {
          updateEvent();
          pendingUpdate.current = false;
        }
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }

    // Reset user action flag for future changes
    isUserAction.current = true;
  }, [
    predictedBudget,
    actualSpent,
    attendance,
    date,
    startTime,
    endTime,
    title,
    location,
    description,
  ]);

  // Helper functions to mark inputs as user actions
  const handleUserInput = (setter) => (e) => {
    isUserAction.current = true;
    setter(e.target.type === "number" ? Number(e.target.value) : e.target.value);
  };

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
          title: title,
          location: location,
          description: description,
          tasks: eventData.tasks,
          budget: {
            predicted: predictedBudget,
            actual: actualSpent,
          },
          attendance: attendance,
          date: date,
          time: {
            start: startTime,
            end: endTime,
          },
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update event");
      }
      const data = await response.json();
      // Temporarily disable user action flag to prevent loop
      isUserAction.current = false;
      setEventData(data);
      if (onUpdateEvent) {
        onUpdateEvent(data);
      }
    } catch (error) {
      console.error("Error updating event:", error);
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


  // Callback to update the status of a specific task.
  const handleTaskStatusChange = (taskId, newStatus) => {
    isUserAction.current = true;
    const updatedTasks = eventData.tasks.map((task) =>
      task._id === taskId ? { ...task, status: newStatus } : task
    );
    const updatedEventData = { ...eventData, tasks: updatedTasks };
    setEventData(updatedEventData);
    updateEvent();
  };

  const handleAddTask = () => {
    setIsAddingTask(true);
  };

  const addNewTask = async () => {
    if (newTaskName.trim() === "") {
      return;
    }

    // Clear input immediately for better UX
    const taskName = newTaskName;
    setNewTaskName("");
    setIsAddingTask(false);

    // Create the new task locally first
    const newTask = {
      name: taskName,
      status: "Not Started",
    };

    // Add to local state
    const updatedTasks = [...eventData.tasks, newTask];

    // Directly send API request without triggering useEffect
    try {
      const response = await fetch("http://localhost:3000/updateEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: eventData._id,
          title: title,
          location: location,
          description: description,
          tasks: updatedTasks,
          budget: {
            predicted: predictedBudget,
            actual: actualSpent,
          },
          attendance: attendance,
          date: date,
          time: {
            start: startTime,
            end: endTime,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update event with new task");
      }

      // Get the updated event data (with proper IDs assigned by MongoDB)
      const data = await response.json();

      // Temporarily disable user action flag to prevent loop
      isUserAction.current = false;
      setEventData(data);

      // Update the parent component through callback
      if (onUpdateEvent) {
        onUpdateEvent(data);
      }
    } catch (error) {
      console.error("Error adding new task:", error);
    }
  };

  const handleNewTaskKeyDown = (e) => {
    if (e.key === "Enter") {
      addNewTask();
    }
  };

  const handleNewTaskBlur = () => {
    if (newTaskName.trim() !== "") {
      addNewTask();
    } else {
      setIsAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    isUserAction.current = true;

    // Filter out the deleted task
    const updatedTasks = eventData.tasks.filter(task => task._id !== taskId);
    console.log("Tasks after deletion:", updatedTasks); // Add this log

    const updatedEventData = { ...eventData, tasks: updatedTasks };

    // Update local state
    setEventData(updatedEventData);

    // Create the request payload
    const payload = {
      _id: eventData._id,
      title: title,
      location: location,
      description: description,
      tasks: updatedTasks,
      budget: {
        predicted: predictedBudget,
        actual: actualSpent,
      },
      attendance: attendance,
      date: date,
      time: {
        start: startTime,
        end: endTime,
      },
    };

    console.log("Sending payload:", payload); // Add this log

    // Send update to server
    try {
      const response = await fetch("http://localhost:3000/updateEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      const data = await response.json();
      console.log("Response from server:", data); // Add this log

      // Temporarily disable user action flag to prevent loop
      isUserAction.current = false;
      setEventData(data);

      // Update the parent component
      if (onUpdateEvent) {
        onUpdateEvent(data);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className={`home_sidebarContainer ${selectedEvent ? "open" : ""}`}>
      <div className="sidebar_header">
        <IconButton id="closeIcon" onClick={closeSidebar}>
          <CloseIcon id="closeButton" />
        </IconButton>
        <IconButton id="calendarIcon" onClick={sendInvite}>
          <img src={GoogleCalIcon} />
        </IconButton>
      </div>
      {eventData && (
        <div className="sidebar_content">
          <h1 className="sidebar_title">{eventData.title}</h1>
          <h2 className="sidebar_subtitle">
            {eventData.date} {eventData.time.start}-{eventData.time.end}
          </h2>
          <h2 className="sidebar_subtitle">{eventData.location}</h2>
          <p>{eventData.description}</p>
          <TextareaAutosize
            className="sidebar_title"
            value={title}
            onChange={handleUserInput(setTitle)}
            placeholder="Enter title"
          />
          {/* Date Input */}
          <input
            className="sidebar_date"
            type="date"
            value={date}
            onChange={handleUserInput(setDate)}
          />
          {/* Time Inputs */}
          <div className="sidebar_timeContainer">
            <input
              className="sidebar_time"
              type="time"
              value={startTime}
              onChange={handleUserInput(setStartTime)}
            />
            <p> - </p>
            <input
              className="sidebar_time"
              type="time"
              value={endTime}
              onChange={handleUserInput(setEndTime)}
            />
          </div>
          <TextareaAutosize
            className="sidebar_location"
            value={location}
            onChange={handleUserInput(setLocation)}
            placeholder="Enter location"
          />
          <TextareaAutosize
            className="sidebar_description"
            value={description}
            onChange={handleUserInput(setDescription)}
            placeholder="Enter description"
          />
          <div className="sidebar_tasks">
            {eventData.tasks && eventData.tasks.map((task) => (
              <Tasks
                key={task._id}
                task={task}
                onStatusChange={handleTaskStatusChange}
                onDelete={handleDeleteTask}
              />
            ))}
            {isAddingTask ? (
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                onKeyDown={handleNewTaskKeyDown}
                onBlur={handleNewTaskBlur}
                autoFocus
                className="sidebar_taskInput"
                placeholder="Enter task name"
              />
            ) : (
              <IconButton onClick={handleAddTask} id="addButton">
                <AddIcon id="addIcon" />
              </IconButton>
            )}
          </div>
          <div className="sidebar_budget">
            <h2 className="sidebar_subtitle">Logistics</h2>
            <div className="budget_item">
              <label htmlFor="predictedBudget">Budget </label>
              <input
                id="predictedBudget"
                type="number"
                value={predictedBudget}
                onChange={handleUserInput(setPredictedBudget)}
              />
            </div>
            <div className="budget_item">
              <label htmlFor="actualSpent">Actual Spent </label>
              <input
                id="actualSpent"
                type="number"
                value={actualSpent}
                onChange={handleUserInput(setActualSpent)}
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
                onChange={handleUserInput(setAttendance)}
              />
            </div>
          </div>
          <div className="sidebar_links">
            <h2 className="sidebar_subtitle">Files</h2>
            {eventData.links && eventData.links.map((link, index) => (
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