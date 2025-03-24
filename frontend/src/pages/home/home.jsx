import React, { useState, useEffect } from 'react';
import './Home.css';
import EventCard from '../../components/eventCard/EventCard';
import NavBar from '../../components/navbar/Navbar';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
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
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const closeSidebar = () => setSelectedEvent(null);

  // Callback to update an event in the events array
  const handleUpdateEvent = (updatedEvent) => {
    setEvents(prevEvents =>
      prevEvents.map(event => event._id === updatedEvent._id ? updatedEvent : event)
    );
    // Also update the selected event if it’s the one being updated.
    if (selectedEvent && selectedEvent._id === updatedEvent._id) {
      setSelectedEvent(updatedEvent);
    }
  };

  const addEvent = async () => {
    try {
      const today = new Date().toISOString();
      const date = today.substring(0,10);
      const event = {
        title: "New Event",
        location: "",
        description: "",
        tasks: [
          {
            name: "Room Confirmation",
            status: "Not Started"
          },
          {
            name: "Finance Confirmation",
            status: "Not Started"
          },
          {
            name: "Finance Confirmation",
            status: "Not Started"
          }
        ],
        budget: {
          predicted: 0,
          actual: 0,
        },
        attendance: 0,
        date: date,
        time: {
          start: "09:00",
          end: "10:00"
        }
      };
      const response = await fetch("http://localhost:3000/createEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
      if (!response.ok) {
        throw new Error("Failed to add event");
      }
      await response.json();
      fetchEvents().then(events => {
        setSelectedEvent(events[events.length - 1]);
      });
    } catch (error) {
      console.error("Error adding event", error);
    }
  }



  return (
    <>
      <NavBar />

      <div className={`home_container ${selectedEvent ? 'sidebar-open' : ''}`}>
        <div className="home_buttonContainer">
          <IconButton id="filterButton">
            <FilterAltIcon id="filterIcon" />
          </IconButton>
          <IconButton id="addButton" onClick={addEvent}>
            <AddIcon id="addIcon"/>
          </IconButton>
        </div>

        <div className={`home_eventsContainer ${selectedEvent ? 'sidebar-open' : ''}`}>
          {events.map((event) => (
            <div
              className='home_cardContainer'
              key={event._id}
              onClick={() => setSelectedEvent(event)}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
        <div className='home_emptyDiv'></div>
      </div>

      <Sidebar
        selectedEvent={selectedEvent}
        closeSidebar={closeSidebar}
        onUpdateEvent={handleUpdateEvent}
      />
    </>
  );
};

export default Home;
