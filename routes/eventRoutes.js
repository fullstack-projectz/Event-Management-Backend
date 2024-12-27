// backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, approveEvent, deleteEvent } = require('../controllers/eventController');

// Admin event routes (CRUD operations)
router.get('/', getEvents);
router.get('/:id', getEventById); // Get a specific event (admin)
router.post('/', createEvent); // Create new event (admin)
router.put('/:id', updateEvent); // Update event (admin)
router.put('/approve/:id', approveEvent); // Approve/reject event (admin)
router.delete('/:id', deleteEvent); // Delete event (admin)

module.exports = router;
