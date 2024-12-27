// backend/models/eventModel.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        hour: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: 'Pending',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
