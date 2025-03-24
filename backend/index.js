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
const Tag = require('./models/tag'); // Add these lines after your existing imports

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

    // Update title, location, description, and tag
    event.title = req.body.title;
    event.location = req.body.location;
    event.description = req.body.description;
    event.tag = req.body.tag;
    event.tagColor = req.body.tagColor; // Add this line to update the tag color

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

// Add these new routes after your existing routes

// Get all tags
app.get('/tags', async (req, res) => {
  try {
    const tags = await Tag.find().sort('name');
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Predefined set of distinct pastel colors
const distinctPastelColors = [
  "#FFB3BA", // Light pink
  "#FFDFBA", // Light orange
  "#FFFFBA", // Light yellow
  "#BAFFC9", // Light green
  "#BAE1FF", // Light blue
  "#E2BAFF", // Light purple
  "#D4A5A5", // Dusty rose
  "#A5C0D4", // Light steel blue
  "#A5D4AD", // Mint
  "#D4CCA5", // Light khaki
  "#BDA5D4", // Lavender
  "#F2C1D1", // Pink
  "#C1F2DD", // Aquamarine
  "#D1C1F2", // Periwinkle
  "#F2E2C1", // Beige
  "#B5EAD7", // Mint cream
  "#FF9AA2", // Melon
  "#C7CEEA", // Periwinkle blue
  "#FFDAC1", // Peach
  "#E2F0CB", // Light lime
  "#B5B9FF", // Pastel blue
  "#DFD3C3", // Tan
  "#C7B8EA", // Lavender purple
  "#FFDBCC", // Light coral
  "#A0CED9"  // Pastel teal
];

// Keep track of which colors have been used
let usedColorIndices = [];

// Function to get a unique color from the array
async function generatePastelColor() {
  // First check how many colors are already in use
  try {
    const existingTags = await Tag.find();
    const existingColors = existingTags.map(tag => tag.color);

    // Find available colors (colors from our array that aren't already used)
    const availableColors = distinctPastelColors.filter(
      color => !existingColors.includes(color)
    );

    if (availableColors.length > 0) {
      // If there are still unused colors, pick one randomly
      return availableColors[Math.floor(Math.random() * availableColors.length)];
    } else {
      // If all predefined colors are used, generate a truly random HSL color
      // that's guaranteed to be different
      const h = Math.floor(Math.random() * 360); // Full hue range 0-359
      const s = Math.floor(Math.random() * 30) + 25; // Saturation 25-54%
      const l = Math.floor(Math.random() * 15) + 80; // Lightness 80-94%

      return `hsl(${h}, ${s}%, ${l}%)`;
    }
  } catch (error) {
    console.error("Error checking existing colors:", error);
    // Fallback to a random color if there's an error
    const randomIndex = Math.floor(Math.random() * distinctPastelColors.length);
    return distinctPastelColors[randomIndex];
  }
}

// Update the route to add a new tag with color
app.post('/tags', async (req, res) => {
  try {
    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: req.body.name });
    if (existingTag) {
      return res.status(200).json(existingTag);
    }

    // Generate a unique pastel color for the new tag
    const color = req.body.color || await generatePastelColor();

    // Create new tag with color
    const tag = new Tag({
      name: req.body.name,
      color: color
    });

    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});