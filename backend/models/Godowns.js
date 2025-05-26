const mongoose = require('mongoose');

const godownSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Godown name
  address: { type: String, required: true }, // Godown address
});

module.exports = mongoose.model('Godown', godownSchema); // Model name remains singular
