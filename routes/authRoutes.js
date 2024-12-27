// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
  
    if (email === 'admin@gmail.com' && password === 'admin@123') {
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
