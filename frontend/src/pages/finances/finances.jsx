import React, { useState, useEffect } from "react";
import {
	Typography,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Paper,
	Box,
	Divider,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import NavBar from "../../components/navbar/Navbar";
import "./finances.css";

export default function Finances() {
	const [events, setEvents] = useState([]);
	const [semesters, setSemesters] = useState([]);
	const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
	const [loading, setLoading] = useState(true);

	// Function to get current semester
	const getCurrentSemester = () => {
		const today = new Date();
		const currentMonth = today.getMonth() + 1;
		const currentYear = today.getFullYear();

		if (currentMonth >= 1 && currentMonth <= 5) {
			return `Spring ${currentYear}`;
		} else {
			return `Fall ${currentYear}`;
		}
	};

	// Fetch all events and extract semesters
	const fetchEvents = async () => {
		try {
			setLoading(true);
			const response = await fetch("http://localhost:3000/events");
			if (!response.ok) {
				throw new Error("Failed to fetch events");
			}

			const data = await response.json();
			setEvents(data);

			// Extract unique semesters
			const uniqueSemesters = [
				...new Set(data.map((event) => event.semester)),
			];

			// Sort semesters chronologically (most recent first)
			uniqueSemesters.sort((a, b) => {
				const yearA = parseInt(a.split(" ")[1]);
				const yearB = parseInt(b.split(" ")[1]);
				const seasonA = a.split(" ")[0];

				if (yearA !== yearB) return yearB - yearA;
				return seasonA === "Fall" ? -1 : 1; // Fall comes before Spring within the same year
			});

			setSemesters(uniqueSemesters);

			// Find index of current semester
			const currentSem = getCurrentSemester();
			const currentIndex = uniqueSemesters.findIndex(
				(sem) => sem === currentSem
			);

			// Set to current semester or first in list if not found
			setCurrentSemesterIndex(currentIndex !== -1 ? currentIndex : 0);

			setLoading(false);
		} catch (error) {
			console.error("Error fetching events:", error);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEvents();
	}, []);

	// Navigate to previous semester
	const handlePrevSemester = () => {
		if (currentSemesterIndex < semesters.length - 1) {
			setCurrentSemesterIndex(currentSemesterIndex + 1);
		}
	};

	// Navigate to next semester
	const handleNextSemester = () => {
		if (currentSemesterIndex > 0) {
			setCurrentSemesterIndex(currentSemesterIndex - 1);
		}
	};

	// Get events for the current semester
	const currentSemesterEvents = events.filter(
		(event) => event.semester === semesters[currentSemesterIndex]
	);

	return (
		<>
			<NavBar />
			<div className="finances-container">
				<div className="semester-navigation">
					<IconButton
						onClick={handlePrevSemester}
						disabled={currentSemesterIndex >= semesters.length - 1}
						className="semester-nav-button"
					>
						<ArrowBackIosNewIcon />
					</IconButton>

					<Typography variant="h4" className="semester-title">
						{semesters[currentSemesterIndex] || "Loading..."}
					</Typography>

					<IconButton
						onClick={handleNextSemester}
						disabled={currentSemesterIndex <= 0}
						className="semester-nav-button"
					>
						<ArrowForwardIosIcon />
					</IconButton>
				</div>

				<Paper elevation={3} className="events-list-container">
					<Typography variant="h5" className="events-list-title">
						Events
					</Typography>
					<Divider />

					{loading ? (
						<Box className="loading-message">
							<Typography>Loading events...</Typography>
						</Box>
					) : currentSemesterEvents.length === 0 ? (
						<Box className="no-events-message">
							<Typography>
								No events found for this semester.
							</Typography>
						</Box>
					) : (
						<List>
							{currentSemesterEvents.map((event) => (
								<React.Fragment key={event._id}>
									<ListItem>
										<ListItemText primary={event.title} />
									</ListItem>
									<Divider component="li" />
								</React.Fragment>
							))}
						</List>
					)}
				</Paper>
			</div>
		</>
	);
}
