import React, { useState, useEffect } from 'react';
import './home.css';
import EventCard from '../../components/eventCard/EventCard';
import NavBar from '../../components/navbar/navbar';

const Home = () => {

    const submit = async () => {
        try {
            const title = document.getElementById('title');
            const description = document.getElementById('description');
            const date = document.getElementById('date');
            const time = document.getElementById('time');
            const location = document.getElementById('location');

            const jsonstring = JSON.stringify({ title: title.value, description: description.value, date: date.value, time: time.value, location: location.value });
            console.log(jsonstring);

            if (!title || !description || !date || !time || !location) return

            const response = await fetch('http://localhost:3000/createEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: title.value, description: description.value, date: date.value, time: time.value, location: location.value })
            });
            if (!response.ok) {
                throw new Error('Oops, something went wrong!');
            }

            console.log("uploaded to database");

            title.value = "";
            description.value = "";
            date.value = "";
            time.value = "";
            location.value = "";

        } catch (err) {
            console.error(err);
        }

    }

    const [events, setEvents] = useState([]);

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

    return (
        <>
            <NavBar />
            <div className="home_container">
                {events.map((event) => (
                    <EventCard key={event._id} event={event} />
                ))}
            </div>
        </>
    );
};

export default Home;