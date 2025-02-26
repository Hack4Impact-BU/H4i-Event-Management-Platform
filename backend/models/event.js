const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    start: {
      type: String,
      default: "",
    },
    end: {
      type: String,
      default: "",
    },
  },
  location: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    default: "general",
  },
  tasks: {
    type: [
      {
        name: { type: String, required: true },
        status: { type: String, default: "Not Started" },
      },
    ],
    default: [],
  },
  links: {
    type: [String],
    default: [],
  },
  budget: {
    predicted: {
      type: Number,
      default: 0.0,
    },
    actual: {
      type: Number,
      default: 0.0,
    },
  },
  attendance: {
    type: Number,
    default: 0,
  },
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
