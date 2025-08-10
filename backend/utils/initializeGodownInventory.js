const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schemas
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

const GodownInventory = mongoose.model('GodownInventory', godownInventorySchema);

// Sample data for godown inventory
const sampleGodownInventory = [
  {
    itemName: 'Laptop',
    quantity: 50,
    price: 45000,
    masterPrice: 42000,
    category: 'Electronics'
  },
  {
    itemName: 'Mouse',
    quantity: 100,
    price: 500,
    masterPrice: 450,
    category: 'Electronics'
  },
  {
    itemName: 'Keyboard',
    quantity: 75,
    price: 1200,
    masterPrice: 1100,
    category: 'Electronics'
  },
  {
    itemName: 'Monitor',
    quantity: 30,
    price: 8000,
    masterPrice: 7500,
    category: 'Electronics'
  },
  {
    itemName: 'Headphones',
    quantity: 60,
    price: 1500,
    masterPrice: 1400,
    category: 'Electronics'
  }
];

async function initializeGodownInventory(godownId) {
  try {
    console.log(`Initializing inventory for godown: ${godownId}`);
    
    for (const item of sampleGodownInventory) {
      const existingItem = await GodownInventory.findOne({
        godownId: godownId,
        itemName: item.itemName
      });
      
      if (!existingItem) {
        const newItem = new GodownInventory({
          godownId: godownId,
          ...item,
          lastUpdated: Date.now()
        });
        await newItem.save();
        console.log(`Added ${item.itemName} with quantity ${item.quantity}`);
      } else {
        console.log(`${item.itemName} already exists in godown inventory`);
      }
    }
    
    console.log('Godown inventory initialization completed!');
  } catch (error) {
    console.error('Error initializing godown inventory:', error);
  }
}

// Function to get all godowns and initialize their inventory
async function initializeAllGodowns() {
  try {
    // Get all godowns from the API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await axios.get(`${backendUrl}/api/godowns/`);
    const godowns = response.data;
    
    console.log(`Found ${godowns.length} godowns`);
    
    for (const godown of godowns) {
      console.log(`\nInitializing inventory for godown: ${godown.name}`);
      await initializeGodownInventory(godown._id);
    }
    
    console.log('\nAll godown inventories initialized successfully!');
  } catch (error) {
    console.error('Error getting godowns:', error);
  }
}

// Run the initialization
if (require.main === module) {
  initializeAllGodowns().then(() => {
    console.log('Script completed');
    process.exit(0);
  }).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { initializeGodownInventory, initializeAllGodowns }; 