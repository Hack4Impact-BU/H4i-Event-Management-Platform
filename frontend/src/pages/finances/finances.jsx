import React, { useState, useEffect, useCallback } from "react";
import {
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Box,
    Divider,
    CircularProgress,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import NavBar from "../../components/navbar/Navbar";
import "./finances.css";

export default function Finances() {
    const [semesters, setSemesters] = useState([]);
    const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [budgetInput, setBudgetInput] = useState("0");
    const [isBudgetUpdating, setIsBudgetUpdating] = useState(false);

    // Function to get current semester name
    const getCurrentSemesterName = () => {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        if (currentMonth >= 1 && currentMonth <= 5) {
            return `Spring ${currentYear}`;
        } else {
            return `Fall ${currentYear}`;
        }
    };

    // Fetch semesters with their associated events
    const fetchSemesters = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3000/semesters");
            if (!response.ok) {
                throw new Error("Failed to fetch semesters");
            }

            const data = await response.json();
            console.log("Fetched semesters:", data); // Debug log

            // If no semesters, create default current semester
            if (data.length === 0) {
                const currentSemName = getCurrentSemesterName();
                console.log("No semesters found, using default:", currentSemName);

                setSemesters([{
                    name: currentSemName,
                    budget: "0",
                    expenses: "0",
                    events: []
                }]);
                setCurrentSemesterIndex(0);
                setBudgetInput("0"); // Set initial budget input
                setLoading(false);
                return;
            }

            // Sort semesters chronologically (most recent first)
            data.sort((a, b) => {
                const yearA = parseInt(a.name.split(" ")[1]);
                const yearB = parseInt(b.name.split(" ")[1]);
                const seasonA = a.name.split(" ")[0];
                const seasonB = b.name.split(" ")[0];

                if (yearA !== yearB) return yearB - yearA;
                if (seasonA === "Fall" && seasonB === "Spring") return -1;
                if (seasonA === "Spring" && seasonB === "Fall") return 1;
                return 0;
            });

            setSemesters(data);

            // Find index of current semester
            const currentSemName = getCurrentSemesterName();
            const currentIndex = data.findIndex(
                (sem) => sem.name === currentSemName
            );

            // Set to current semester or first in list if not found
            const indexToUse = currentIndex !== -1 ? currentIndex : 0;
            setCurrentSemesterIndex(indexToUse);

            // Set budget input to match the current semester's budget
            if (data[indexToUse]) {
                setBudgetInput(data[indexToUse].budget || "0");
            }

            console.log("Current semester index:", indexToUse);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching semesters:", error);
            // On error, set up a default semester so UI doesn't break
            setSemesters([{
                name: getCurrentSemesterName(),
                budget: "0",
                expenses: "0",
                events: []
            }]);
            setCurrentSemesterIndex(0);
            setBudgetInput("0"); // Set default budget input
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSemesters();
    }, []);

    // Helper function to calculate balance
    const calculateBalance = (budget, expenses) => {
        const budgetValue = parseFloat(budget) || 0;
        const expensesValue = parseFloat(expenses) || 0;
        return (budgetValue - expensesValue).toFixed(2);
    };

    // Get the current semester object
    const currentSemester = semesters[currentSemesterIndex] || { name: "", events: [] };

    // Update local budget input when current semester changes
    useEffect(() => {
        if (currentSemester && currentSemester.budget) {
            setBudgetInput(currentSemester.budget);
        } else {
            setBudgetInput("0");
        }
    }, [currentSemesterIndex, semesters]);

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

    // Handle budget input change
    const handleBudgetChange = (e) => {
        setBudgetInput(e.target.value);
    };

    // Function to update semester budget in database
    const updateSemesterBudget = useCallback(async () => {
        if (!currentSemester || !currentSemester._id) return;

        try {
            setIsBudgetUpdating(true);

            const response = await fetch("http://localhost:3000/updateSemesterBudget", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    semesterId: currentSemester._id,
                    budget: budgetInput
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update semester budget");
            }

            const updatedSemester = await response.json();

            // Update the local state with the updated semester
            setSemesters(prevSemesters =>
                prevSemesters.map(sem =>
                    sem._id === updatedSemester._id ? updatedSemester : sem
                )
            );

            console.log("Budget updated successfully");
        } catch (error) {
            console.error("Error updating budget:", error);
        } finally {
            setIsBudgetUpdating(false);
        }
    }, [currentSemester, budgetInput]);

    // Save budget when input loses focus
    const handleBudgetBlur = () => {
        updateSemesterBudget();
    };

    // Handle Enter key press to save budget
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            updateSemesterBudget();
            e.target.blur(); // Remove focus from input
        }
    };

    return (
        <>
            <NavBar />
            <div className="finances-container">
                <div className="semester-navigation">
                    <IconButton
                        onClick={handlePrevSemester}
                        disabled={currentSemesterIndex >= semesters.length - 1 || loading}
                        className="semester-nav-button"
                    >
                        <ArrowBackIosNewIcon />
                    </IconButton>

                    <Typography variant="h4" className="semester-title">
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            currentSemester.name || "No Semesters"
                        )}
                    </Typography>

                    <IconButton
                        onClick={handleNextSemester}
                        disabled={currentSemesterIndex <= 0 || loading}
                        className="semester-nav-button"
                    >
                        <ArrowForwardIosIcon />
                    </IconButton>
                </div>

                <div className="semester-finances">
                    <label className="semester-budget-label">
                        Semester Budget:
                    </label>
                    <input
                        className="semester-budget-input"
                        value={budgetInput}
                        onChange={handleBudgetChange}
                        onBlur={handleBudgetBlur}
                        onKeyPress={handleKeyPress}
                        disabled={isBudgetUpdating || loading}
                        type="text"
                    />
                    {isBudgetUpdating && <CircularProgress size={16} className="budget-updating-indicator" />}

                    <p>Current Balance: <span>${calculateBalance(currentSemester.budget || "0", currentSemester.expenses || "0")}</span></p>
                    <p>Current Expenses: <span>${currentSemester.expenses || "0"}</span></p>
                </div>


            </div>
        </>
    );
}
