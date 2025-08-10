const mongoose = require('mongoose');

const godownInventorySchema = new mongoose.Schema({
  godownId: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown', required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true },
  masterPrice: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  minStockLevel: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Create compound index for godownId and itemName
godownInventorySchema.index({ godownId: 1, itemName: 1 }, { unique: true });

module.exports = mongoose.model('GodownInventory', godownInventorySchema);
