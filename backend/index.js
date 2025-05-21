require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const Event = require('./models/event');
const Tag = require('./models/tag');
const Semester = require('./models/semester');
const User = require('./models/user');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const cors = require('cors');
const cron = require('node-cron');
const { cleanupInactiveUsers } = require('./utils/cleanupUsers');

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

// Update the createEvent endpoint

app.post('/createEvent', async (req, res) => {
  console.log(req.body);
  try {
    const semesterName = req.body.semesterName || req.body.semester; // Support both fields for backward compatibility

    // Check if semester exists
    let semester = await Semester.findOne({ name: semesterName });

    // If semester doesn't exist, create it
    if (!semester) {
      semester = new Semester({
        name: semesterName,
        budget: "0",
        expenses: "0",
        events: []
      });
      await semester.save();
      console.log(`Created new semester: ${semesterName}`);
    }

    // Create the event with a reference to the semester
    const eventData = {
      ...req.body,
      semester: semester._id,
      semesterName: semesterName
    };

    const event = new Event(eventData);
    await event.save();

    // Add the event to the semester's events array
    semester.events.push(event._id);

    // Update the semester's expenses with the new event's actual budget
    const actualBudget = event.budget.actual || 0;
    const currentExpenses = parseFloat(semester.expenses) || 0;
    semester.expenses = (currentExpenses + actualBudget).toFixed(2);

    await semester.save();

    res.status(201).send(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).send(error);
  }
});

// Add this as a separate endpoint (it was mistakenly inside the createEvent endpoint)
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find().populate('semester');
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

    // Store old actual budget for comparison
    const oldActualBudget = event.budget.actual;

    // Store new actual budget - MOVED THIS UP
    const newActualBudget = req.body.budget.actual || 0;

    // Check if semester has changed
    const newSemesterName = req.body.semesterName || req.body.semester;
    if (newSemesterName && event.semesterName !== newSemesterName) {
      // Find or create the new semester
      let newSemester = await Semester.findOne({ name: newSemesterName });
      if (!newSemester) {
        newSemester = new Semester({
          name: newSemesterName,
          budget: "0",
          expenses: "0",
          events: []
        });
        await newSemester.save();
      }

      // Remove event from old semester and update old semester's expenses
      if (event.semester) {
        // Get the old semester to update its expenses
        const oldSemester = await Semester.findById(event.semester);
        if (oldSemester) {
          // Remove the event's actual budget from the old semester's expenses
          const oldSemesterExpenses = parseFloat(oldSemester.expenses) - oldActualBudget;
          oldSemester.expenses = Math.max(0, oldSemesterExpenses).toFixed(2);
          await oldSemester.save();
        }

        // Remove event from old semester's events array
        await Semester.findByIdAndUpdate(
          event.semester,
          { $pull: { events: event._id } }
        );
      }

      // Add event to new semester
      newSemester.events.push(event._id);

      // Add the event's actual budget to the new semester's expenses
      const newSemesterExpenses = parseFloat(newSemester.expenses) || 0;
      newSemester.expenses = (newSemesterExpenses + newActualBudget).toFixed(2);

      await newSemester.save();

      // Update event with new semester reference
      event.semester = newSemester._id;
      event.semesterName = newSemesterName;
    }

    // Update basic fields
    event.title = req.body.title;
    event.location = req.body.location || "";
    event.description = req.body.description || "";
    event.tag = req.body.tag;
    event.tagColor = req.body.tagColor;

    // Update the status based on date or use provided status
    if (req.body.status) {
      event.status = req.body.status;
    } else {
      const eventDate = new Date(req.body.date);
      const today = new Date();
      eventDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      event.status = eventDate >= today ? "upcoming" : "completed";
    }

    // Update other fields...
    event.budget.predicted = req.body.budget.predicted || 0;
    event.budget.actual = newActualBudget; // Just use the already defined variable
    event.attendance = req.body.attendance || 0;

    // Update date if provided
    if (req.body.date) {
      event.date = req.body.date;
    }

    // Update time if provided
    if (req.body.time.start && req.body.time.end) {
      event.time.start = req.body.time.start;
      event.time.end = req.body.time.end;
    }

    // Handle tasks...
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

    if (req.body.links) {
      event.links = [];

      req.body.links.forEach(link => {
        event.links.push({
          _id: link._id,
          name: link.name,
          url: link.url,
          assignee: link.assignee,
        });
      });
    }

    await event.save();

    // Update the semester's expenses if the actual budget has changed
    if (oldActualBudget !== newActualBudget) {
      const semester = await Semester.findById(event.semester);
      if (semester) {
        // Calculate the difference between old and new actual budget
        const budgetDifference = newActualBudget - oldActualBudget;

        // Update the semester's expenses
        const currentExpenses = parseFloat(semester.expenses) || 0;
        const newExpenses = Math.max(0, currentExpenses + budgetDifference);
        semester.expenses = newExpenses.toFixed(2);
        await semester.save();
      }
    }

    res.status(200).send(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: error.message });
  }
});

const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/userinfo.profile'];
// const TOKEN_PATH = path.join(process.cwd(), 'token.json');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_REDIRECT_URI
);

// Start authentication for a specific user – require an email parameter and pass it in state
app.get('/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',     // so you get a refresh_token
    scope: SCOPES,
    prompt: 'consent',          // force refresh_token each time
  });
  res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("Missing code or email");
    }
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2' });
    const { data: profile } = await oauth2.userinfo.get({ auth: oauth2Client });
    console.log('profile', profile);
    const email = profile.email;
    console.log(email);
    const name = profile.name;
    console.log(name);

    const updatedUser = await User.findOneAndUpdate(
      { name },
      { googleTokens: tokens },
    );
    res.send(`Google Calendar authorized for ${email}. You can now close this window.`);
  } catch (err) {
    console.error('OAuth callback error', err);
    res.status(500).send('Authentication failed');
  }
});

function setClientCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

// Modified ensureAuth middleware – it expects the user to pass their email (in query or body)
// and loads the corresponding googleTokens from the database.
async function ensureAuth(req, res, next) {
  const email = req.query.email || req.body.email;
  if (!email) {
    return res.status(400).json({ message: "Missing email parameter" });
  }
  const user = await User.findOne({ email });
  if (!user || !user.googleTokens) {
    return res.status(401).json({ redirect: `https://your-deployed-domain/auth?email=${encodeURIComponent(email)}` });
  }
  req.authClient = setClientCredentials(user.googleTokens);
  next();
}

// Insert an event into the authenticated user's calendar
function insertEvent(resource, auth) {
  return google.calendar({ version: 'v3', auth })
    .events.insert({ calendarId: 'primary', resource });
}

// Endpoint to create a calendar event using the authenticated user's credentials
app.post('/sendInvite', ensureAuth, async (req, res) => {
  try {
    const authClient = req.authClient;
    const created = await insertEvent(req.body, authClient);
    res.json({ htmlLink: created.data.htmlLink });
  } catch (err) {
    console.error(err);
    // If the error indicates the user needs to re-authenticate, then redirect
    if (err.message.includes('unauthorized')) {
      return res.redirect(`https://your-deployed-domain/auth?email=${encodeURIComponent(req.body.email)}`);
    }
    res.status(500).json({ message: err.message });
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

app.post('/updateAssignee', async (req, res) => {
  const { linkId, newAssignee } = req.body;

  try {
    const result = await Event.findOneAndUpdate(
      { "links._id": linkId },
      { $set: { "links.$.assignee": newAssignee } },
      { new: true }
    );

    if (!result) {
      console.log("Link not found for ID:", linkId);
      return res.status(404).json({ message: "Link not found" });
    }

    const updatedLink = result.links.find(link => link._id.toString() === linkId);
    console.log("Updated link:", updatedLink);

    res.status(200).json(updatedLink);
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

// Update the deleteEvent endpoint

app.post('/deleteEvent', async (req, res) => {
  try {
    const event = await Event.findById(req.body._id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Remove event from semester's events array and update expenses
    if (event.semester) {
      const semester = await Semester.findById(event.semester);
      if (semester) {
        // Subtract the event's actual budget from the semester's expenses
        const actualBudget = event.budget.actual || 0;
        const currentExpenses = parseFloat(semester.expenses) || 0;
        const newExpenses = Math.max(0, currentExpenses - actualBudget);
        semester.expenses = newExpenses.toFixed(2);

        // Remove the event from semester's events array
        semester.events.pull(event._id);

        await semester.save();
      } else {
        // If semester not found but ID exists, just remove the reference
        await Semester.findByIdAndUpdate(
          event.semester,
          { $pull: { events: event._id } }
        );
      }
    }

    // Delete the event
    const response = await Event.deleteOne({ _id: req.body._id });

    res.status(200).send(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/deleteLink', async (req, res) => {
  try {
    const { eventId, linkId } = req.body;
    const response = await Event.findOneAndUpdate(
      { _id: eventId },
      { $pull: { links: { _id: linkId } } },
      { new: true }
    );
    if (!response) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).send(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new endpoint to get semesters with their events
app.get('/semesters', async (req, res) => {
  try {
    const semesters = await Semester.find().populate('events');
    res.status(200).json(semesters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new endpoint to get a specific semester with its events
app.get('/semesters/:id', async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id).populate('events');
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    res.status(200).json(semester);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this endpoint to your existing backend

app.post('/updateSemesterBudget', async (req, res) => {
  try {
    const { semesterId, budget } = req.body;

    if (!semesterId) {
      return res.status(400).json({ message: "Semester ID is required" });
    }

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }

    // Update the budget
    semester.budget = budget;
    await semester.save();

    // Return the updated semester
    res.status(200).json(semester);
  } catch (error) {
    console.error("Error updating semester budget:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add this endpoint after your existing routes
app.post('/users/login', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user's last login time and name
      user.lastLoggedIn = new Date();
      user.name = name; // Update in case name changed
      await user.save();
    } else {
      // Create new user with unique color
      const color = await generateUniqueUserColor();
      user = new User({
        email,
        name,
        color,
        lastLoggedIn: new Date(),
        googleTokens: null,
      });
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error processing user login:', error);
    res.status(500).json({ message: error.message });
  }
});

// Function to generate unique user colors (similar to tag colors)
async function generateUniqueUserColor() {
  try {
    const existingUsers = await User.find();
    const existingColors = existingUsers.map(user => user.color);

    // Find available colors from our predefined list
    const availableColors = distinctPastelColors.filter(
      color => !existingColors.includes(color)
    );

    if (availableColors.length > 0) {
      // Use an available color
      return availableColors[Math.floor(Math.random() * availableColors.length)];
    } else {
      // Generate a random HSL color if all predefined colors are used
      const h = Math.floor(Math.random() * 360);
      const s = Math.floor(Math.random() * 30) + 25; // 25-54% saturation
      const l = Math.floor(Math.random() * 15) + 80; // 80-94% lightness

      return `hsl(${h}, ${s}%, ${l}%)`;
    }
  } catch (error) {
    console.error("Error generating user color:", error);
    // Fallback to a random color
    const randomIndex = Math.floor(Math.random() * distinctPastelColors.length);
    return distinctPastelColors[randomIndex];
  }
}

// Add this endpoint to get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort('name');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Schedule task to run at midnight every day
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled cleanup of inactive users...');
  try {
    const removedCount = await cleanupInactiveUsers();
    console.log(`Successfully removed ${removedCount} inactive users`);
  } catch (error) {
    console.error('Scheduled cleanup failed:', error);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});