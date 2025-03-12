require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const express = require('express');
const Event = require('./models/event');

const cors = require('cors');

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
  console.log(req.body);
  try {
    const event = await Event.findById(req.body._id);
    console.log(event);
    event.budget.predicted = req.body.budget.predicted;
    event.budget.actual = req.body.budget.actual;
    event.attendance = req.body.attendance;
    await event.save();
    res.status(200).send(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

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
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});