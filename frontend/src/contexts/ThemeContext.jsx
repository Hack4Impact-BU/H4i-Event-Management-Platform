import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext({
    darkMode: false,
    toggleDarkMode: () => { },
});

export const ThemeProvider = ({ children }) => {
    // Check local storage for saved preference, default to light mode
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('darkMode');
        return savedTheme === 'true';
    });

    // Update body class and save preference when dark mode changes
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    // Function to toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};