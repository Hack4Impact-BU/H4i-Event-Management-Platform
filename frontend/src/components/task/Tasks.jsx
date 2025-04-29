import React, { useState, useEffect } from "react";
import "./Tasks.css";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Dropdown from "../dropdown/Dropdown.jsx";

const Task = ({ task, onStatusChange, onDelete }) => {
  const [status, setStatus] = useState(task.status || "Not Started");

  // Update local status when task prop changes
  useEffect(() => {
    setStatus(task.status || "Not Started");
  }, [task.status]);

  const handleStatusChange = (newStatus) => {
    // Update local state immediately for responsive UI
    setStatus(newStatus);

    // Call the parent callback to handle the API update
    if (onStatusChange) {
      onStatusChange(task._id, newStatus);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task._id);
    }
  };

  return (
    <div className="task_container" key={task._id}>
      <p className="task_name">{task.name}</p>
      <div className="task_controls">
        <Dropdown
          options={["Not Started", "In Progress", "Done"]}
          defaultValue={status}
          onChange={handleStatusChange}
        />
        <IconButton
          onClick={handleDelete}
          className="delete_button"
        >
          <DeleteIcon className="delete_icon" />
        </IconButton>
      </div>
    </div>
  );
};

export default Task;
