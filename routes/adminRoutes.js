const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // User model
const Event = require('../models/eventModel');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware'); // Apply middleware
const router = express.Router();

// Admin login (Authentication)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await User.findOne({ email });

        if (!admin || admin.role !== 'admin') {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Admin logged in successfully', token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin route to view all users
router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin route to get a specific user by ID
router.get('/users/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // Fetch user by ID
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin route to update a user
router.put('/users/:id', authMiddleware, async (req, res) => {
    const { name, email, role } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update user details
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role; // Allow admin to update roles (e.g., admin/user)

        await user.save();
        res.json({ message: 'User updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin route to delete a user
router.delete('/users/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.remove();
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin route to view all events
router.get('/events', authMiddleware, async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin route to create a new event
router.post('/events', authMiddleware, async (req, res) => {
    const { title, description, date, location, status, hour } = req.body; // Event details from the request body

    try {
        if (!title || !description || !date || !location) {
            return res.status(400).json({ message: 'All fields (title, description, date, location) are required' });
        }

        // Create a new event document
        const newEvent = new Event({
            title,
            description,
            date,
            location,
            hour,
            status: status || 'Pending', // Default status is "Pending" if not provided
            createdBy: req.user.id,
        });

        // Save the event to the database
        const savedEvent = await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: savedEvent });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.put('/events/:id', authMiddleware, async (req, res) => {
    const { status } = req.body; // Get status from the request body
    try {
        const event = await Event.findById(req.params.id); // Find event by ID
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        // Update the status field of the event
        event.status = status;
        await event.save();

        res.json({ message: 'Event status updated successfully', event });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin route to delete an event
router.delete('/events/:id', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id); // Find the event by ID
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if the logged-in user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this event' });
        }

        // Delete the event
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
