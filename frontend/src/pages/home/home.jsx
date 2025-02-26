import React, { useState, useEffect } from 'react';
import './home.css';
import EventCard from '../../components/eventCard/EventCard';
import NavBar from '../../components/navbar/Navbar';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import Sidebar from '../../components/sidebar/Sidebar';


const Home = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); 

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3000/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const closeSidebar = () => setSelectedEvent(null);

  return (
    <>
      <NavBar />
      
      <div className={`home_container ${selectedEvent ? 'sidebar-open' : ''}`}>
        <div className="home_buttonContainer">
          <IconButton>
            <FilterAltIcon id="filterButton" />
          </IconButton>
          <IconButton>
            <AddIcon id="addButton" />
          </IconButton>
        </div>
        
        <div className={`home_eventsContainer ${selectedEvent ? 'sidebar-open' : ''}`}>
          {events.map((event) => (
            <div className='home_cardContainer' key={event._id} 
            onClick={() => setSelectedEvent(event)}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
        <div className='home_emptyDiv'></div>
      </div>
      
      <Sidebar selectedEvent={selectedEvent} closeSidebar={closeSidebar} />
    </>
  );
};

export default Home;
