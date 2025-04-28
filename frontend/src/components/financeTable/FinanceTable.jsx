import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import Dropdown from "../dropdown/Dropdown";
import "./FinanceTable.css";

const FinanceTable = (semester) => {
    const [rows, setRows] = useState([]);
    const [tags, setTags] = useState([]);
    const [tagColors, setTagColors] = useState({});

    useEffect(() => {
        fetchEvents().then(data => sortEvents(data));
        fetchTags();
    }, []);
    
    const fetchEvents = async () => {
        try {
            const response = await fetch('http://localhost:3000/events');
            if (!response.ok) {
            throw new Error('Failed to fetch events');
            }
            const data = await response.json();
    
            return data;
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch('http://localhost:3000/tags');
            if (!response.ok) {
            throw new Error('Failed to fetch tags');
            }
            const data = await response.json();

            const tags = [];
            const tagColors = {};

            data.forEach(tag => {
                tags.push(tag.name);
                tagColors[tag.name] = tag.color;
            });

            setTags(tags);
            setTagColors(tagColors);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleTagChange = async (event, value) => {
        try {
            const response = await fetch('http://localhost:3000/updateEvent', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    _id: event._id,
                    title: event.title,
                    location: event.location,
                    description: event.description,
                    tag: value,
                    tagColor: tagColors[value] || "#C2E2C7",
                    date: event.date,
                    budget: {
                        predicted: event.budget.predicted,
                        actual: event.budget.actual,
                    },
                    attendance: event.attendance,
                    time: {
                        start: event.time.start,
                        end: event.time.end,
                    },
                    tasks: event.tasks,
                    link: event.links,
                })
            });

            if (!response.ok) {
                console.error("Failed to update tag");
            };


        } catch (error) {
            console.error("Error updating tag", error);
        }
        
    }

    const sortEvents = (data) => {
        let temp = data;
        const today = new Date();

        temp.sort((a, b) => new Date(b.date) - new Date(a.date))
        temp = temp.filter((event) => new Date(event.date) <= today);
        
        temp = temp.filter((event) =>  event.semesterName === semester.semester?.name);

        setRows(temp);
    }

    
    return (
        <div className="finance_table_container">
            <Table id="finance_table">
                <TableHead>
                    <TableRow>
                        <TableCell>Event Name</TableCell>
                        <TableCell align="center">Category</TableCell>
                        <TableCell align="center">Event Date</TableCell>
                        <TableCell align="center">Total Expenses</TableCell>
                        <TableCell align="center">Attendance</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {rows.map((row) => (
                    <TableRow
                    key={row._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell>{row.title}</TableCell>
                    <TableCell align="center">
                        <Dropdown
                            options={tags}
                            defaultValue={row.tag}
                            onChange={(value) => handleTagChange(row, value)}
                            renderOption={(option) => (
                                <>
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
                                    {option}
                                </>
                            )}
                        />
                    </TableCell>
                    <TableCell align="center">{new Date(`${row.date}T00:00:00`).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</TableCell>
                    <TableCell align="center">${row.budget.actual}</TableCell>
                    <TableCell align="center">{row.attendance}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default FinanceTable;