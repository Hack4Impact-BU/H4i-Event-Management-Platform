import React, { useState, useRef, useEffect } from "react";
import "./Dropdown.css";

const Dropdown = ({ options, defaultValue, onChange, renderOption }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(
        defaultValue || options[0]
    );

    useEffect(() => {
        if (defaultValue) {
            setSelectedOption(defaultValue);
        }
    }, [defaultValue]);

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
                            {renderOption ? renderOption(option) : option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;