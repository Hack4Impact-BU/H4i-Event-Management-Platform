const mongoose = require("mongoose");
const { Schema } = mongoose;

const SemesterSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    budget: {
        type: String,
        default: "0"
    },
    expenses: {
        type: String,
        default: "0"
    },
    events: [
        {
            type: Schema.Types.ObjectId,
            ref: "Event"
        }
    ]
});

const Semester = mongoose.model("Semester", SemesterSchema);

module.exports = Semester;