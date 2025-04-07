import React, { useState, useEffect } from 'react';
import './Home.css';
import EventCard from '../../components/eventCard/EventCard';
import NavBar from '../../components/navbar/Navbar';
import { IconButton, Typography, Tabs, Tab, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Sidebar from '../../components/sidebar/Sidebar';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3000/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);

      // Process events to determine status and sort them
      processEvents(data);

      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Process events to categorize as upcoming or past and sort them
  const processEvents = (eventsList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison

    const upcoming = [];
    const past = [];

    eventsList.forEach(event => {
      // Parse the event date
      const eventDate = new Date(`${event.date}T00:00:00`);

      // Update event status
      event.status = eventDate >= today ? "upcoming" : "completed";

      // Sort into appropriate array
      if (event.status === "upcoming") {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    // Sort upcoming events from earliest to latest
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Sort past events from latest to earliest
    past.sort((a, b) => new Date(b.date) - new Date(a.date));

    setUpcomingEvents(upcoming);
    setPastEvents(past);
  };

  useEffect(() => {
    fetchEvents();

    // Set up a daily interval to check and update event status
    const updateInterval = setInterval(() => {
      if (events.length > 0) {
        processEvents(events);
      }
    }, 86400000); // 24 hours

    return () => clearInterval(updateInterval);
  }, []);

  const closeSidebar = () => setSelectedEvent(null);

  // Callback to update an event in the events array
  const handleUpdateEvent = async (updatedEvent) => {
    // setEvents(prevEvents =>
    //   prevEvents.map(event => event._id === updatedEvent._id ? updatedEvent : event)
    // );
    // Also update the selected event if it's the one being updated.
    // if (selectedEvent && selectedEvent._id === updatedEvent._id) {
    //   setSelectedEvent(updatedEvent);
    // }
    fetchEvents();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedEvent(null);
  };

  const addEvent = async () => {
    try {
      const today = new Date().toISOString();
      const date = today.substring(0, 10);

      // Calculate if the event is upcoming or completed based on date
      const eventDate = new Date(`${date}T00:00:00`);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const status = eventDate >= todayDate ? "upcoming" : "completed";

      const event = {
        title: "New Event",
        location: "",
        description: "",
        status: status, // Add status field
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
            name: "Events Confirmation",
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
      // Switch to upcoming tab when adding a new event
      setActiveTab(0);
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
            <AddIcon id="addIcon" />
          </IconButton>
        </div>

        <div className={`home_eventsContent ${selectedEvent ? 'sidebar-open' : ''}`}>
          <Box className="tabs-container">
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              className="event-tabs"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Upcoming Events" className="event-tab" />
              <Tab label="Past Events" className="event-tab" />
            </Tabs>
          </Box>

          {/* Upcoming Events Tab */}
          {activeTab === 0 && (
            <div className="events_grid">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    className={`home_cardContainer ${selectedEvent && selectedEvent._id === event._id ? "selected-event" : ""}`}
                    key={event._id}
                    onClick={() => setSelectedEvent(event)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-0.5rem)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <EventCard event={event} />
                  </div>
                ))
              ) : (
                <Typography className="no_events_message">
                  No upcoming events
                </Typography>
              )}
            </div>
          )}

          {/* Past Events Tab */}
          {activeTab === 1 && (
            <div className="events_grid">
              {pastEvents.length > 0 ? (
                pastEvents.map((event) => (
                  <div
                    className={`home_cardContainer ${selectedEvent && selectedEvent._id === event._id ? "selected-event" : ""}`}
                    key={event._id}
                    onClick={() => setSelectedEvent(event)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-0.5rem)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <EventCard event={event} />
                  </div>
                ))
              ) : (
                <Typography className="no_events_message">
                  No past events
                </Typography>
              )}
            </div>
          )}
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
