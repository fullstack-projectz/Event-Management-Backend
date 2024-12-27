// backend/routes/userRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create an event (only for authenticated users)
router.post('/events', authMiddleware, async (req, res) => {
    const { name, description, date, hour } = req.body;
    const userId = req.user.id; // Get the user from the authenticated token

    try {
        const event = new Event({
            title,
            description,
            date,
            location, 
            createdBy: userId,
        });
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Edit an event (only for the event's creator)
router.put('/events/:id', authMiddleware, async (req, res) => {
    const { name, description, date, hour, status } = req.body;
    const userId = req.user.id; // Get the user from the authenticated token

    try {
        const event = await Event.findById(req.params.id);
        if (!event || event.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only edit your own events' });
        }

        if (name) event.name = name;
        if (description) event.description = description;
        if (date) event.date = date;
        if (hour) event.hour = hour;
        if (status) event.status = status;

        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all events created by the authenticated user
router.get('/events', authMiddleware, async (req, res) => {
    const userId = req.user.id; // Get the user from the authenticated token

    try {
        const events = await Event.find({ createdBy: userId });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;