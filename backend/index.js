const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://dwijya:LDwioICbJrkWsO2F@h4i-event-management.vv9i0.mongodb.net/event-management?retryWrites=true&w=majority&appName=h4i-event-management';

mongoose.connect(MONGO_URI)
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

const express = require('express');
const Event = require('./models/event');

const app = express();
app.use(express.json());

app.post('/createEvent', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).send(event);
  } catch (error) {
    res.status(400).send(error);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});