require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const Event = require('./models/event');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const cors = require('cors');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const app = express();
app.use(cors());
app.use(express.json());

app.post('/createEvent', async (req, res) => {
  console.log(req.body);
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).send(event);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/updateEvent', async (req, res) => {
  try {
    const event = await Event.findById(req.body._id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Update title, location, and description
    event.title = req.body.title;
    event.location = req.body.location;
    event.description = req.body.description;

    // Update logistics fields
    event.budget.predicted = req.body.budget.predicted;
    event.budget.actual = req.body.budget.actual;
    event.attendance = req.body.attendance;

    // Update date if provided
    if (req.body.date) {
      event.date = req.body.date;
    }

    // Update time if provided
    if (req.body.time) {
      event.time.start = req.body.time.start;
      event.time.end = req.body.time.end;
    }

    // IMPORTANT: Replace entire tasks array with the one from the request
    // This ensures deletions are properly handled
    if (req.body.tasks) {
      // Clear existing tasks
      event.tasks = [];

      // Add all tasks from the request
      req.body.tasks.forEach(task => {
        event.tasks.push({
          _id: task._id, // Keep existing IDs for existing tasks
          name: task.name,
          status: task.status
        });
      });
    }

    await event.save();
    res.status(200).send(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/updateTaskStatus', async (req, res) => {
  const { taskId, newStatus } = req.body;
  try {
    // Find the event document that has the task with the given taskId
    const event = await Event.findOne({ "tasks._id": taskId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    // Get the task subdocument by its id
    const task = event.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    // Update the task's status
    task.status = newStatus;
    await event.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})


// TODO: send user email confirmation before adding to calendar
// TODO: display text telling user that event was added to calendar

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(process.cwd(), 'credentials/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials/credentials.json');

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (error) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize(event) {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function listEvents( event, auth ) {
  console.log(auth);
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.insert({
    auth: auth,
    calendarId: 'primary',
    resource: event,
  }, function(err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event created: %s', event.htmlLink);
  });
}

app.post('/sendInvite', async (req, res) => {
  const event = req.body;
  try {
    authorize().then(auth => listEvents(event, auth));
  } catch (error) {
    console.error(error);
  }
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});