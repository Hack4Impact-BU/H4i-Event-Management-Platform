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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});