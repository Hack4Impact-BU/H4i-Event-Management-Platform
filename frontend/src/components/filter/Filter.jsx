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

    useEffect(() => {
        // Fetch tag colors from the server
        const fetchTagColors = async () => {
            try {
                const response = await fetch('http://localhost:3000/tags');
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
            setFilters(selectedFilters);
        } else {
            // Default all tags to NOT selected if no filters are applied yet
            const initialFilters = {};
            availableTags.forEach(tag => {
                initialFilters[tag] = false;
            });
            setFilters(initialFilters);
        }
    }, [availableTags, selectedFilters, isOpen]);

    const handleFilterChange = (tag) => {
        setFilters(prev => ({
            ...prev,
            [tag]: !prev[tag]
        }));
    };

    const handleApplyFilters = () => {
        onApplyFilters(filters);
        onClose();
    };

    const handleSelectAll = () => {
        const allSelected = {};
        availableTags.forEach(tag => {
            allSelected[tag] = true;
        });
        setFilters(allSelected);
    };

    const handleClearAll = () => {
        const allCleared = {};
        availableTags.forEach(tag => {
            allCleared[tag] = false;
        });
        setFilters(allCleared);
    };

    return (
        <Popover
            open={isOpen}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            PaperProps={{
                className: "filter-popup-container",
                style: { backgroundColor: "#E4E9EE" }
            }}
        >
            <Typography variant="h6" className="filter-popup-title">
                Filter by Tags
            </Typography>

            <div className="filter-actions">
                <Button variant="text" onClick={handleSelectAll} className="filter-action-button">
                    Select All
                </Button>
                <Button variant="text" onClick={handleClearAll} className="filter-action-button">
                    Clear All
                </Button>
            </div>

            <Divider sx={{ my: 1 }} />

            <Box className="filter-options-container">
                <FormGroup className="filter-options">
                    {availableTags.map((tag) => (
                        <FormControlLabel
                            key={tag}
                            control={
                                <Checkbox
                                    checked={!!filters[tag]}
                                    onChange={() => handleFilterChange(tag)}
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

            <Divider sx={{ my: 1 }} />

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