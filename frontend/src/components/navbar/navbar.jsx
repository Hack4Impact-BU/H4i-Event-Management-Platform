import React from 'react';
import { Box, IconButton, Button, Typography, Link } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import H4iLogo from '../../assets/hack4impact-logo.jpg';
import './navbar.css';

const NavBar = () => {
    return (
        <Box className="navbar">
            <img id="h4i_logo" src={H4iLogo} />
            <Box className="pages">
                <Link id="events_box" href="#" underline="hover">
                    <EventNoteOutlinedIcon id="event_icon" />
                    <Typography id="events" variant='h5'>Events</Typography>
                </Link>
                <Link id="finances_box" href="#" underline="hover" variant='h4'>
                    <AttachMoneyOutlinedIcon id="finance_icon" />
                    <Typography id="finances" variant='h5'>Finances</Typography>
                </Link>
                <Link id="budget_simulation_box" href="#" underline="hover" variant='h4'>
                    <WatchLaterOutlinedIcon id="budget_icon" />
                    <Typography id="budget_simulation" variant='h5'>Budget Simulation</Typography>
                </Link>
            </Box>
            <IconButton>
                <SettingsOutlinedIcon id="setting_button" />
            </IconButton>
        </Box>
    )
}

export default NavBar;