const bcrypt = require('bcryptjs');
const User = require('../models/User'); 
const { validateUserRegistration } = require('../utils/validation'); 

// User Registration
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    const { error } = validateUserRegistration(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
