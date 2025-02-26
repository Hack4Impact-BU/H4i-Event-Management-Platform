import React, { useState, useRef, useEffect } from 'react';
import './Tasks.css';

const CustomDropdown = ({ options, defaultValue, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue || options[0]);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="custom_dropdown_container" ref={dropdownRef}>
      <div 
        className="custom_dropdown_header" 
        onClick={toggleDropdown}
      >
        <span className="dropdown_selected_value">{selectedOption}</span>
        <span className="dropdown_arrow"></span>
      </div>
      
      {isOpen && (
        <div className="custom_dropdown_options">
          {options.map((option) => (
            <div 
              key={option} 
              className={`dropdown_option ${selectedOption === option ? 'selected' : ''}`}
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

const Task = ({ task }) => {
  const [status, setStatus] = useState('Not Started');
  
  const handleStatusChange = (value) => {
    setStatus(value);
  };

  return (
    <div className="task_container" key={task._id}>
      <p className='task_name'>{task}</p>
      <CustomDropdown 
        options={['Not Started', 'In Progress', 'Done']} 
        defaultValue={status}
        onChange={handleStatusChange}
      />
    </div>
  );
};

export default Task;