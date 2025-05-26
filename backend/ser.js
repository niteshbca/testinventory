const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mernAuth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Schema and model
const deliveryItemSchema = new mongoose.Schema({
  name: String,
  godown: String,
  date: String, // Date in "YYYY-MM-DD" format
  time: String, // Time in "HH:MM:SS" format
});

const DeliveryItem = mongoose.model('DeliveryItem', deliveryItemSchema);

// API route
app.post('/api/checkAndAddItem', async (req, res) => {
  try {
    const { input, godown, date, time } = req.body;

    const newItem = new DeliveryItem({ name: input, godown, date, time });
    await newItem.save();

    res.status(200).json({ success: true, message: 'Item added successfully!' });
  } catch (error) {
    console.error('Error saving item:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

