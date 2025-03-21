import React, { useState, useRef, useEffect } from "react";
import "./Tasks.css";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

const CustomDropdown = ({ options, defaultValue, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    defaultValue || options[0]
  );
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getClassName = (option) => option.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="custom_dropdown_container" ref={dropdownRef}>
      <div className="custom_dropdown_header" onClick={toggleDropdown}>
        <span
          className={`dropdown_selected_value ${getClassName(selectedOption)}`}
        >
          {selectedOption}
        </span>
        <span className="dropdown_arrow"></span>
      </div>

      {isOpen && (
        <div className="custom_dropdown_options">
          {options.map((option) => (
            <div
              key={option}
              className={`dropdown_option ${selectedOption === option ? "selected" : ""
                } ${getClassName(option)}`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Task = ({ task, onStatusChange, onDelete }) => {
  const [status, setStatus] = useState(task.status || "Not Started");

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    // Optional: call any parent callback with the updated status
    if (onStatusChange) {
      onStatusChange(task._id, newStatus);
    }
    // Make an API call to update the task status in the backend
    fetch("http://localhost:3000/updateTaskStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskId: task._id, newStatus }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Task updated:", data))
      .catch((err) => console.error("Error updating task:", err));
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
        <CustomDropdown
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
