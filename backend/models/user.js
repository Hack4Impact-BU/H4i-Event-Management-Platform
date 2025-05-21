const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    lastLoggedIn: {
        type: Date,
        default: Date.now
    },
    googleTokens: {
        type: Object,
        default: null,
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;