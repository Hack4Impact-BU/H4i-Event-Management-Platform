import React, { useState, useEffect, useRef } from "react";
import { IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./Sidebar.css";
import Tasks from "../task/Tasks";
import Dropdown from "../dropdown/Dropdown";
import TextareaAutosize from "react-textarea-autosize";
import AddIcon from "@mui/icons-material/Add";
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
  const [tag, setTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [availableTags, setAvailableTags] = useState(["general", "speaker event", "social", "workshop"]);
  const [tagColors, setTagColors] = useState({ general: "#C2E2C7" });
  const [calendarEventAdded, setCalendarEventAdded] = useState(false);
  const [showCalendarConfirmation, setShowCalendarConfirmation] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

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
      // Make sure we set the tag from the selected event, with a default fallback
      setTag(selectedEvent.tag || "general");
      setCalendarEventAdded(false);
      setShowCalendarConfirmation(false);
      setIsDeletingEvent(false);
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
    tag, // Add tag to the dependency array
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
          tag: tag,
          tagColor: tagColors[tag] || "#C2E2C7", // Include the tag color
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
      setCalendarEventAdded(true);
      const response = await fetch("http://localhost:3000/sendInvite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          'summary': `🌎 ${selectedEvent.title}`,
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
  const handleTaskStatusChange = async (taskId, newStatus) => {
    isUserAction.current = true;

    // Update local state first
    const updatedTasks = eventData.tasks.map((task) =>
      task._id === taskId ? { ...task, status: newStatus } : task
    );
    const updatedEventData = { ...eventData, tasks: updatedTasks };
    setEventData(updatedEventData);

    // Make direct API call to update task status
    try {
      const response = await fetch("http://localhost:3000/updateTaskStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId, newStatus }),
      });

      if (!response.ok) {
        console.error("Failed to update task status");
        throw new Error("Failed to update task status");
      }

      // Also notify parent component
      if (onUpdateEvent) {
        onUpdateEvent(updatedEventData);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
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
          tag: tag, // Include tag in the payload
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
      tag: tag, // Include tag in the payload
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

  // Handle tag change
  const handleTagChange = (newTag) => {
    if (newTag === "Add tag...") {
      setIsAddingTag(true);
    } else {
      isUserAction.current = true;
      setTag(newTag);
    }
  };

  // Add a new tag
  const handleAddNewTag = async () => {
    if (newTagName.trim() === "") {
      setIsAddingTag(false);
      return;
    }

    const tagName = newTagName.trim();
    setNewTagName("");
    setIsAddingTag(false);

    try {
      // Add new tag to the backend
      const response = await fetch('http://localhost:3000/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: tagName }),
      });

      if (!response.ok) {
        throw new Error('Failed to save tag');
      }

      const newTag = await response.json();

      // Update local state with new tag and its color
      setAvailableTags(prev => [...prev, tagName]);
      setTagColors(prev => ({ ...prev, [tagName]: newTag.color }));

      // Set it as the current tag
      isUserAction.current = true;
      setTag(tagName);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  // Handle key down in new tag input
  const handleNewTagKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddNewTag();
    }
    if (e.key === "Escape") {
      setIsAddingTag(false);
      setNewTagName("");
    }
  };

  // Fetch tags with colors
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('http://localhost:3000/tags');
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        const data = await response.json();

        // Create a dictionary of tag names to colors
        const tagDict = {};
        const tagNames = [];

        data.forEach(tag => {
          tagDict[tag.name] = tag.color;
          tagNames.push(tag.name);
        });

        setAvailableTags(tagNames);
        setTagColors(tagDict);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);


  const confirmCalendarEvent = () => {
    setShowCalendarConfirmation(true);
  };

  const handleCalendarConfirm = async () => {
    // User confirmed; hide confirmation and send invite.
    setShowCalendarConfirmation(false);
    await sendInvite();
  };

  const handleCalendarCancel = () => {
    // User cancelled; simply hide the confirmation.
    setShowCalendarConfirmation(false);
  };

  const confirmDeleteEvent = () => {
    setIsDeletingEvent(true);
  }

  const handleDeleteConfirm = async() => {
    setIsDeletingEvent(false);
  }

  const handleDeleteCancel = () => {
    setIsDeletingEvent(false);
  }

  return (
    <div className={`home_sidebarContainer ${selectedEvent ? "open" : ""}`}>
      <div className="sidebar_header">
        <IconButton id="closeButton" onClick={closeSidebar}>
          <CloseIcon id="closeIcon" />
        </IconButton>
        <IconButton id="calendarButton" onClick={confirmCalendarEvent}>
          <img src={GoogleCalIcon} id="calendarIcon" />
        </IconButton>
      </div>
      {showCalendarConfirmation && (
        <div className="calendar_confirmation_prompt">
          <p>Add Event to Calendar?</p>
          <Button id="confirmation_button" variant="outlined" onClick={handleCalendarConfirm}>Confirm</Button>
          <Button id="cancellation_button" variant="outlined" onClick={handleCalendarCancel}>Cancel</Button>
        </div>
      )}
      {calendarEventAdded && (
        <div className="event_confirmation_text">
          <h5 id="event_confirmation_text_inner">Event Added to Calendar</h5>
        </div>
      )}
      {eventData && (
        <div className="sidebar_content">
          <TextareaAutosize
            className="sidebar_title"
            value={title}
            onChange={handleUserInput(setTitle)}
            placeholder="Enter title"
          />
          {/* Date and Tag Inputs */}
          <div className="sidebar_dateTagContainer">
            <input
              className="sidebar_date"
              type="date"
              value={date}
              onChange={handleUserInput(setDate)}
            />

            {isAddingTag ? (
              <div className="sidebar_newTagContainer">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={handleNewTagKeyDown}
                  onBlur={handleAddNewTag}
                  autoFocus
                  className="sidebar_tagInput"
                  placeholder="New tag name"
                />
              </div>
            ) : (
              <div className="sidebar_tagDropdown">
                <Dropdown
                  options={[...availableTags, "Add tag..."]}
                  defaultValue={tag} // This should now update correctly
                  onChange={handleTagChange}
                  renderOption={(option) => (
                    <>
                      {option !== "Add tag..." && (
                        <span
                          className="tag-color-indicator"
                          style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: tagColors[option] || "#C2E2C7",
                            marginRight: "8px",
                          }}
                        />
                      )}
                      {option}
                    </>
                  )}
                />
              </div>
            )}
          </div>
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
                value={predictedBudget === 0 ? "" : predictedBudget}
                onChange={handleUserInput(setPredictedBudget)}
              />
            </div>
            <div className="budget_item">
              <label htmlFor="actualSpent">Actual Spent </label>
              <input
                id="actualSpent"
                type="number"
                value={actualSpent === 0 ? "" : actualSpent}
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
                value={attendance === 0 ? "" : attendance}
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
      <div className="event_deletion">
        <Button id="delete_event_button" variant="outlined" onClick={confirmDeleteEvent}>DELETE TASK</Button>
        {isDeletingEvent && (
          <div className="delete_event_prompt">
            <h3>Add Event to Calendar?</h3>
            <div className="button_field">
              <Button id="confirmation_button2" variant="outlined" onClick={handleDeleteConfirm}>Confirm Deletion</Button>
              <Button id="cancellation_button2" variant="outlined" onClick={handleDeleteCancel}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;