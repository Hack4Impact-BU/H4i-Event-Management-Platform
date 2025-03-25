const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    color: {
        type: String,
        required: true,
        default: "#C2E2C7" // Default color for "general" tag
    }
});

const Tag = mongoose.model("Tag", TagSchema);

module.exports = Tag;