import React from 'react';
import './home.css';
import EventCard from '../../components/eventCard/EventCard';

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

    return (
        <div className='home_container'>
            {/* <form onSubmit={(e) => e.preventDefault()}>
                <label htmlFor='title'>Title: </label>
                <input type='text' 
                id='title'/>
                <br/>
                <label htmlFor='description'>Description: </label>
                <input type='text' 
                id='description'/>
                <br/>
                <label htmlFor='date'>Date: </label>
                <input type='text' 
                id='date'/>
                <br/>
                <label htmlFor='time'>Time: </label>
                <input type='text' 
                id='time'/>
                <br/>
                <label htmlFor='location'>Location: </label>
                <input type='text' 
                id='location'/>
                <br/>
                <button type='submit' onClick={submit}>Submit</button>
            </form> */}
            <EventCard />
        </div>
    );
};

export default Home;