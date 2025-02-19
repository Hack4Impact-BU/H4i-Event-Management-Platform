import React, { useState, useEffect } from 'react';
import './home.css';
import EventCard from '../../components/eventCard/EventCard';

const Home = () => {
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

    const submit = async () => {
        try {
            const title = document.getElementById('title');
            const description = document.getElementById('description');
            const date = document.getElementById('date');
            const time = document.getElementById('time');
            const location = document.getElementById('location');

            if (!title.value || !description.value || !date.value || !time.value || !location.value) return;

            const payload = {
                title: title.value,
                description: description.value,
                date: date.value,
                time: time.value,
                location: location.value,
            };

            const response = await fetch('http://localhost:3000/createEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error('Oops, something went wrong!');
            }

            console.log("Uploaded to database");

            title.value = "";
            description.value = "";
            date.value = "";
            time.value = "";
            location.value = "";

            fetchEvents();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className='home_container'>
            {events.map((event) => (
                <EventCard key={event._id} event={event} />
            ))}

            <form onSubmit={(e) => e.preventDefault()}>
                <label htmlFor='title'>Title: </label>
                <input type='text' id='title' />
                <br />
                <label htmlFor='description'>Description: </label>
                <input type='text' id='description' />
                <br />
                <label htmlFor='date'>Date: </label>
                <input type='text' id='date' />
                <br />
                <label htmlFor='time'>Time: </label>
                <input type='text' id='time' />
                <br />
                <label htmlFor='location'>Location: </label>
                <input type='text' id='location' />
                <br />
                <button type='submit' onClick={submit}>Submit</button>
            </form>
        </div>
    );
};

export default Home;