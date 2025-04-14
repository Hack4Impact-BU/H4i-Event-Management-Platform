const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
	semester: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
		trim: true,
	},
	description: {
		type: String,
		required: false,
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
		required: false,
	},
	tag: {
		type: String,
		default: "general",
	},
	tagColor: {
		type: String,
		default: "",
	},
	status: {
		type: String,
		enum: ["upcoming", "completed"],
		default: "upcoming",
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
		type: [
			{
				name: { type: String, required: true },
				url: { type: String, required: true },
				assignee: { type: String },
			},
		],
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
