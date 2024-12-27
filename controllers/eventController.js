// backend/controllers/eventController.js
const Event = require('../models/eventModel');

// Get all events (Admin view)
const getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get event by ID (Admin/User view)
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new event (Admin/User)
const createEvent = async (req, res) => {
    const { name, date, status, createdBy } = req.body;

    try {
        const newEvent = new Event({ name, date, status, createdBy });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update event (Admin)
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.name = req.body.name || event.name;
        event.date = req.body.date || event.date;
        event.status = req.body.status || event.status;

        await event.save();
        res.json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Approve or Reject event (Admin only)
const approveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.status = req.body.status; // Expect 'Approved' or 'Rejected'
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete event (Admin only)
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    approveEvent,
    deleteEvent,
};
