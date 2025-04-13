import React, { useState, useEffect, useRef, forwardRef } from "react";
import { IconButton, Button, Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./Sidebar.css";
import Tasks from "../task/Tasks";
import Dropdown from "../dropdown/Dropdown";
import TextareaAutosize from "react-textarea-autosize";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GoogleCalIcon from "../../assets/google_calendar_icon.svg";
import "./Sidebar.css";

const Sidebar = forwardRef(({ selectedEvent, closeSidebar, onUpdateEvent }, ref) => {
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
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkURL, setNewLinkURL] = useState("");
  const [newLinkAssignee, setNewLinkAssignee] = useState("Director of Operations");

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
      setIsAddingLink(false);
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

  const handleAddLink = () => {
    setNewLinkName("");
    setNewLinkURL("");
    setNewLinkAssignee("");
    setIsAddingLink(true);
  }

  const addNewLink = async () => {
    if (newLinkName.trim() === "" || newLinkURL.trim() === "") {
      return;
    }

    const linkName = newLinkName;
    const linkURL = newLinkURL;
    const linkAssignee = newLinkAssignee;
    setNewLinkName("");
    setNewLinkURL("");
    setNewLinkAssignee("Director of Operations");
    setIsAddingLink(false);

    const newLink = {
      name: linkName,
      url: linkURL,
      assignee: linkAssignee,
    };

    const updatedLinks = [...eventData.links, newLink];

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
          links: updatedLinks,
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update event with new link");
      }

      const data = await response.json();

      isUserAction.current = false;
      setEventData(data);

      if (onUpdateEvent) {
        onUpdateEvent(data);
      }
    } catch (error) {
      console.error("Error adding new link:", error);
    }
  }

  const handleAssigneeChange = async (linkId, newAssignee) => {
    isUserAction.current = true;

    const updatedLinks = eventData.links.map((link) =>
      link._id === linkId ? { ...link, assignee: newAssignee } : link
    );
    const updatedEventData = { ...eventData, links: updatedLinks };
    setEventData(updatedEventData);

    try {
      const response = await fetch("http://localhost:3000/updateAssignee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ linkId, newAssignee }),
      });

      if (!response.ok) {
        console.error("Failed to update assignee");
      }

      if (onUpdateEvent) {
        onUpdateEvent(updatedEventData);
      }
    } catch (error) {
      console.error("Error updating assignee", error);
    }
  }

  const deleteLink = async (linkId) => {
    try {
      const eventId = selectedEvent._id;
      const response = await fetch("http://localhost:3000/deleteLink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, linkId })
      });

      if (!response.ok) {
        console.error("Failed to delete task");
      }

      const updatedLinks = eventData.links.filter(link => link._id !== linkId);
      const updatedEventData = { ...eventData, links: updatedLinks };

      setEventData(updatedEventData);

      if (onUpdateEvent) {
        onUpdateEvent(updatedEventData);
      }
    } catch (error) {
      console.error("Error deleting task", error);
    }
  }

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

  const confirmDeleteEvent = async () => {
    setIsDeletingEvent(true);
  }

  const handleDeleteConfirm = async () => {
    setIsDeletingEvent(false);
    closeSidebar();
    try {
      const response = await fetch('http://localhost:3000/deleteEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: selectedEvent._id })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data = await response.json();

      if (onUpdateEvent) {
        onUpdateEvent(data);
      }
    } catch (error) {
      console.error("Error deleting task", error);
    }
  }

  const handleDeleteCancel = () => {
    setIsDeletingEvent(false);
  }

  return (
    <div
      className={`home_sidebarContainer ${selectedEvent ? "open" : ""}`}
      ref={ref}
    >
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
              <Accordion id="link_container" key={index}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  id="link_title"
                >
                  <h2>{link.name}</h2>
                </AccordionSummary>
                <AccordionDetails id="link_details_container">
                  <div>
                    <p>
                      URL: <a href={link.url} target="_blank">{link.url}</a>
                    </p>
                    <div className="link_assignee_container">
                      <p>Assignee:</p>
                      <div className="link_assignee_dropdown">
                        <Dropdown
                          options={["Director of Operations", "Community", "Treasurer"]}
                          defaultValue={link.assignee}
                          onChange={(val) => handleAssigneeChange(link._id, val)}
                        />
                      </div>
                    </div>
                    <div className="delete_button_container">
                      <Button id="delete_link_button" variant="outlined" onClick={() => deleteLink(link._id)}>Delete Link</Button>
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            ))}
            {isAddingLink ? (
              <div className="link_input_container">
                <input
                  type="text"
                  value={newLinkName}
                  onChange={(e) => setNewLinkName(e.target.value)}
                  autoFocus
                  className="sidebar_taskInput"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={newLinkURL}
                  onChange={(e) => setNewLinkURL(e.target.value)}
                  autoFocus
                  className="sidebar_taskInput"
                  placeholder="URL"
                />
                <div className="assignee_init_container">
                  <h4>Assignee:</h4>
                  <Dropdown
                    options={["Director of Operations", "Community", "Treasurer"]}
                    defaultValue="Director of Operations"
                    onChange={(e) => { setNewLinkAssignee(e) }}
                  />
                </div>
                <div className="link_button_container">
                  <Button id="confirmation_button3" variant="outlined" onClick={addNewLink}>Submit</Button>
                  <Button id="cancellation_button3" variant="outlined" onClick={() => setIsAddingLink(false)}>Cancel</Button>
                </div>

              </div>

            ) : (
              <IconButton onClick={handleAddLink} id="addButton">
                <AddIcon id="addIcon" />
              </IconButton>
            )

            }
          </div>
        </div>
      )}
      <div className="event_deletion">
        <Button id="delete_event_button" variant="outlined" onClick={confirmDeleteEvent}>DELETE EVENT</Button>
        {isDeletingEvent && (
          <div className="delete_event_prompt">
            <h3>Delete Event?</h3>
            <div className="button_field">
              <Button id="confirmation_button2" variant="outlined" onClick={handleDeleteConfirm}>Confirm Delete</Button>
              <Button id="cancellation_button2" variant="outlined" onClick={handleDeleteCancel}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Sidebar;