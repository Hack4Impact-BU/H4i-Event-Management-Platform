import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import H4iLogo from "../../assets/h4i_removed_bg.png";
import "./Navbar.css";

const NavBar = () => {
	return (
		<Box className="navbar">
			<img id="h4i_logo" src={H4iLogo} alt="H4i Logo" />
			<Box className="pages">
				<RouterLink
					id="events_box"
					to="/home"
					style={{ textDecoration: "none" }}
				>
					<EventNoteOutlinedIcon id="event_icon" />
					<Typography id="events" variant="h5">
						Events
					</Typography>
				</RouterLink>
				<RouterLink
					id="finances_box"
					to="/finances"
					style={{ textDecoration: "none" }}
				>
					<AttachMoneyOutlinedIcon id="finance_icon" />
					<Typography id="finances" variant="h5">
						Finances
					</Typography>
				</RouterLink>
			</Box>
			<IconButton id="settings_icon">
				<SettingsOutlinedIcon id="setting_button" />
			</IconButton>
		</Box>
	);
};

export default NavBar;
