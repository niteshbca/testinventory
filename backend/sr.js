// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/mernAuth')
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Schema and Model
const dsaleSchema = new mongoose.Schema({
  selectedOption: String,
  inputValue: String,
  godownName: String,
  username: String,
  mobileNumber: String,
}, { collection: 'dsale' });

const Dsale = mongoose.model('Dsale', dsaleSchema);

// Get all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await Dsale.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
