const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  links: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link'
  }],
  budget: {
    predicted: {
      type: Number,
      default: 0.00
    },
    actual: {
      type: Number,
      default: 0.00
    }
  },
  headCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;