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
  console.log("Updating task status:", taskId, newStatus); // Add debugging

  try {
    // Use the more reliable findOneAndUpdate with $ operators
    const result = await Event.findOneAndUpdate(
      { "tasks._id": taskId },
      { $set: { "tasks.$.status": newStatus } },
      { new: true } // Return updated document
    );

    if (!result) {
      console.log("Task not found for ID:", taskId);
      return res.status(404).json({ message: "Task not found" });
    }

    // Find the updated task to return
    const updatedTask = result.tasks.find(task => task._id.toString() === taskId);
    console.log("Updated task:", updatedTask);

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});