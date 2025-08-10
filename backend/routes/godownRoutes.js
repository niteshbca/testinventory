const express = require('express');
const router = express.Router();
const Godown = require('../models/Godowns'); // Updated import for Godown model

// Login route to validate name and address
router.post('/login', async (req, res) => {
  const { name, address } = req.body;

  try {
    const godown = await Godown.findOne({ name, address }); // Querying database
    if (godown) {
      res.status(200).json({
        message: 'Login successful',
        godown,
      });
    } else {
      res.status(404).json({
        message: 'Invalid Godown name or address',
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
});

module.exports = router;
