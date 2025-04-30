import React, { useState, useEffect } from 'react';
import {
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Typography,
    Popover,
    Divider,
    Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './Filter.css';

const Filter = ({
    isOpen,
    onClose,
    availableTags,
    selectedFilters,
    onApplyFilters,
    anchorEl
}) => {
    const [filters, setFilters] = useState(selectedFilters || {});
    const [tagColors, setTagColors] = useState({});
    const [expandedSection, setExpandedSection] = useState(null);
    const [commonTasks, setCommonTasks] = useState([]);
    const [closingSection, setClosingSection] = useState(null);

    // Define task status options
    const taskStatusOptions = ["Not Started", "In Progress", "Done"];

    // Update the toggle function to ensure the animation fully plays
    const toggleSection = (section) => {
        // If clicking the already expanded section, close it
        if (expandedSection === section) {
            // First, mark this section as closing
            setClosingSection(section);
            // Clear the expandedSection immediately so CSS classes apply correctly
            setExpandedSection(null);
            // Then remove the element after animation completes
            setTimeout(() => {
                setClosingSection(null);
            }, 250); // Match animation duration
        } else {
            // If there's already an expanded section, close it first
            if (expandedSection) {
                setClosingSection(expandedSection);
                setExpandedSection(null); // Immediately clear expanded to start closing animation

                // After the closing animation finishes, set the new expanded section
                setTimeout(() => {
                    setExpandedSection(section);
                    setClosingSection(null);
                }, 250);
            } else {
                // If nothing is expanded, just expand the clicked section
                setExpandedSection(section);
            }
        }
    };

    // Fetch common tasks from events
    useEffect(() => {
        const fetchCommonTasks = async () => {
            try {
                const response = await fetch('https://h4i-event-management-platform-production.up.railway.app/events');
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                const events = await response.json();

                // Extract all tasks from all events and count occurrences
                const taskCounts = {};
                events.forEach(event => {
                    if (event.tasks && Array.isArray(event.tasks)) {
                        event.tasks.forEach(task => {
                            if (task.name) {
                                taskCounts[task.name] = (taskCounts[task.name] || 0) + 1;
                            }
                        });
                    }
                });

                // Get tasks that appear in multiple events (common tasks)
                const commonTaskNames = Object.keys(taskCounts).filter(taskName =>
                    taskCounts[taskName] > 0
                );

                setCommonTasks(commonTaskNames);
            } catch (error) {
                console.error('Error fetching common tasks:', error);
                // Default to the three common tasks if fetch fails
                setCommonTasks([
                    "Room Confirmation",
                    "Finance Confirmation",
                    "Events Confirmation"
                ]);
            }
        };

        fetchCommonTasks();
    }, []);

    useEffect(() => {
        // Fetch tag colors from the server
        const fetchTagColors = async () => {
            try {
                const response = await fetch('https://h4i-event-management-platform-production.up.railway.app/tags');
                if (!response.ok) {
                    throw new Error('Failed to fetch tags');
                }
                const data = await response.json();

                // Create a mapping of tag names to colors
                const colors = {};
                data.forEach(tag => {
                    colors[tag.name] = tag.color;
                });

                setTagColors(colors);
            } catch (error) {
                console.error('Error fetching tag colors:', error);
            }
        };

        fetchTagColors();
    }, []);

    useEffect(() => {
        // Initialize filters with current selection
        if (selectedFilters && Object.keys(selectedFilters).length > 0) {
            // Make sure the filters object has the proper structure
            const updatedFilters = {
                tags: selectedFilters.tags || {},
                tasks: selectedFilters.tasks || {}
            };
            setFilters(updatedFilters);
        } else {
            // Default all tags and task filters to NOT selected
            const initialFilters = {
                tags: {},
                tasks: {}
            };

            // Initialize tag filters
            availableTags.forEach(tag => {
                initialFilters.tags[tag] = false;
            });

            // Initialize tasks filters (nested structure)
            commonTasks.forEach(taskName => {
                initialFilters.tasks[taskName] = {
                    "Not Started": false,
                    "In Progress": false,
                    "Done": false
                };
            });

            setFilters(initialFilters);
        }

        // Reset expanded section when filter popup opens/closes
        setExpandedSection(null);
    }, [availableTags, selectedFilters, isOpen, commonTasks]);

    const handleTagFilterChange = (tag) => {
        setFilters(prev => ({
            ...prev,
            tags: {
                ...prev.tags,
                [tag]: !prev.tags[tag]
            }
        }));
    };

    const handleTaskStatusFilterChange = (taskName, status) => {
        setFilters(prev => {
            // Ensure tasks object exists
            const tasks = prev.tasks || {};
            // Ensure this task exists in the tasks object
            const task = tasks[taskName] || {
                "Not Started": false,
                "In Progress": false,
                "Done": false
            };

            return {
                ...prev,
                tasks: {
                    ...tasks,
                    [taskName]: {
                        ...task,
                        [status]: !task[status]
                    }
                }
            };
        });
    };

    const handleApplyFilters = () => {
        onApplyFilters(filters);
        onClose();
    };

    const handleClearAllTags = () => {
        const updatedFilters = { ...filters };
        availableTags.forEach(tag => {
            updatedFilters.tags[tag] = false;
        });
        setFilters(updatedFilters);
    };

    const handleClearAllTaskStatuses = (taskName) => {
        setFilters(prev => {
            const updatedTasks = { ...(prev.tasks || {}) };

            updatedTasks[taskName] = {
                "Not Started": false,
                "In Progress": false,
                "Done": false
            };

            return {
                ...prev,
                tasks: updatedTasks
            };
        });
    };

    // Add a new function to handle clearing all task statuses at once
    const handleClearAllTasks = () => {
        const updatedFilters = { ...filters };

        // Reset all task statuses to false
        if (updatedFilters.tasks) {
            Object.keys(updatedFilters.tasks).forEach(taskName => {
                updatedFilters.tasks[taskName] = {
                    "Not Started": false,
                    "In Progress": false,
                    "Done": false
                };
            });
        }

        setFilters(updatedFilters);
    };

    return (
        <Popover
            open={isOpen}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            PaperProps={{
                className: "filter-popup-container",
                style: {
                    backgroundColor: "#E4E9EE",
                    maxHeight: 'calc(100vh - 64px)', // Subtract navbar height
                    overflowY: 'auto'
                }
            }}
        >
            <Typography variant="h6" className="filter-popup-title">
                Filters
            </Typography>

            {/* Custom Tags Filter Section */}
            <div className="custom-accordion">
                <div
                    className="custom-accordion-header"
                    onClick={() => toggleSection('tags')}
                >
                    <Typography className="filter-section-title">Tags</Typography>
                    <div className={`expand-icon ${expandedSection === 'tags' ? 'expanded' : ''}`}>
                        <ExpandMoreIcon />
                    </div>
                </div>

                {(expandedSection === 'tags' || closingSection === 'tags') && (
                    <div className={`custom-accordion-content ${expandedSection === 'tags' ? 'opening' : 'closing'}`}>
                        <div className="filter-actions">
                            <Button variant="text" onClick={handleClearAllTags} className="filter-action-button">
                                Clear All
                            </Button>
                        </div>

                        <Box className="filter-options-container">
                            <FormGroup className="filter-options">
                                {availableTags.map((tag) => (
                                    <FormControlLabel
                                        key={tag}
                                        control={
                                            <Checkbox
                                                checked={!!filters.tags?.[tag]}
                                                onChange={() => handleTagFilterChange(tag)}
                                                className="filter-checkbox"
                                            />
                                        }
                                        label={
                                            <div className="filter-tag-item">
                                                <span
                                                    className="filter-tag-color"
                                                    style={{ backgroundColor: tagColors[tag] || "#C2E2C7" }}
                                                />
                                                {tag}
                                            </div>
                                        }
                                    />
                                ))}
                            </FormGroup>
                        </Box>
                    </div>
                )}
            </div>

            {/* Task Filters Section */}
            <div className="custom-accordion">
                <div
                    className="custom-accordion-header"
                    onClick={() => toggleSection('tasks')}
                >
                    <Typography className="filter-section-title">Tasks</Typography>
                    <div className={`expand-icon ${expandedSection === 'tasks' ? 'expanded' : ''}`}>
                        <ExpandMoreIcon />
                    </div>
                </div>

                {(expandedSection === 'tasks' || closingSection === 'tasks') && (
                    <div className={`custom-accordion-content tasks-content ${expandedSection === 'tasks' ? 'opening' : 'closing'}`}>
                        <div className="filter-actions">
                            <Button variant="text" onClick={handleClearAllTasks} className="filter-action-button">
                                Clear All
                            </Button>
                        </div>

                        {commonTasks.map(taskName => (
                            <div key={taskName} className="task-filter-section">
                                <Typography className="task-name">{taskName}</Typography>

                                <FormGroup className="filter-options">
                                    {taskStatusOptions.map(status => (
                                        <FormControlLabel
                                            key={`${taskName}-${status}`}
                                            control={
                                                <Checkbox
                                                    checked={!!filters.tasks?.[taskName]?.[status]}
                                                    onChange={() => handleTaskStatusFilterChange(taskName, status)}
                                                    className="filter-checkbox"
                                                />
                                            }
                                            label={
                                                <div className={`filter-status-item filter-status-${status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {status}
                                                </div>
                                            }
                                        />
                                    ))}
                                </FormGroup>
                                <Divider sx={{ my: 1 }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="filter-popup-buttons">
                <Button variant="outlined" onClick={onClose} className="filter-cancel-button">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleApplyFilters}
                    className="filter-apply-button"
                >
                    Apply Filters
                </Button>
            </div>
        </Popover>
    );
};

export default Filter;