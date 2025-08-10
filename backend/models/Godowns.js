const mongoose = require('mongoose');

const godownSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Godown name
  address: { type: String, required: true }, // Godown address
  email: { type: String, required: true, unique: true }, // Godown email
  password: { type: String, required: true }, // Godown password
  city: { type: String, required: true }, // Godown city
  state: { type: String, required: true }, // Godown state
});

module.exports = mongoose.model('Godown', godownSchema); // Model name remains singular
