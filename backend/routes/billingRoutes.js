const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Godown = require('../models/Godowns');
const GodownInventory = require('../models/GodownInventory');

// Customer Schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  gstNo: { type: String },
  phoneNumber: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Item Schema
const itemSchema = new mongoose.Schema({
  srNo: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  masterPrice: { type: Number, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Inventory Schema
const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true },
  masterPrice: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  minStockLevel: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Bill Schema
const billSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  godownId: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown' },
  godownName: { type: String },
  items: [{
    itemId: { type: String },
    itemName: { type: String, required: true },
    price: { type: Number, required: true },
    masterPrice: { type: Number, required: true },
    selectedPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  priceType: { type: String, enum: ['price', 'masterPrice'], default: 'price' },
  createdAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', customerSchema);
const BillingItem = mongoose.model('BillingItem', itemSchema);
const BillingInventory = mongoose.model('BillingInventory', inventorySchema);
const Bill = mongoose.model('Bill', billSchema);

// Generate unique bill number
const generateBillNumber = async () => {
  const count = await Bill.countDocuments();
  return `BILL-${String(count + 1).padStart(6, '0')}`;
};

// ==================== CUSTOMER ROUTES ====================

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Billing API is working!' });
});

// Get all customers
router.get('/customers/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single customer
router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new customer
router.post('/customers/add', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    const savedCustomer = await customer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update customer
router.put('/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete customer
router.delete('/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ITEM ROUTES ====================

// Get items for a customer
router.get('/items/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    console.log('Fetching items for customer:', customerId);
    
    // Check if customerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      console.log('Invalid customer ID format:', customerId);
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }
    
    // First, let's check if there are any items in the database at all
    const totalItems = await BillingItem.countDocuments();
    console.log('Total items in database:', totalItems);
    
    // Check if there are any items for this customer
    const customerItemsCount = await BillingItem.countDocuments({ customerId });
    console.log('Items count for this customer:', customerItemsCount);
    
    // Get all items for this customer
    const items = await BillingItem.find({ customerId: customerId }).sort({ srNo: 1 });
    console.log('Found items:', items.length);
    console.log('Items data:', items);
    
    // Also try a more flexible search
    const allItems = await BillingItem.find({});
    console.log('All items in database:', allItems);
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add new item
router.post('/items/add', async (req, res) => {
  try {
    console.log('Adding new item:', req.body);
    console.log('Customer ID in request:', req.body.customerId);
    console.log('Customer ID type:', typeof req.body.customerId);
    
    // Convert customerId to ObjectId if it's a string
    const itemData = {
      ...req.body,
      customerId: mongoose.Types.ObjectId.isValid(req.body.customerId) 
        ? req.body.customerId 
        : new mongoose.Types.ObjectId(req.body.customerId)
    };
    
    console.log('Processed item data:', itemData);
    
    const item = new BillingItem(itemData);
    console.log('Item object before save:', item);
    
    const savedItem = await item.save();
    console.log('Item saved successfully:', savedItem._id);
    console.log('Saved item data:', savedItem);
    
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update item
router.post('/items/update/:id', async (req, res) => {
  try {
    const item = await BillingItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete item
router.delete('/items/:id', async (req, res) => {
  try {
    const item = await BillingItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk update items from Excel
router.post('/items/bulk-update/:customerId', async (req, res) => {
  try {
    const { items } = req.body;
    const customerId = req.params.customerId;
    console.log('Bulk updating items for customer:', customerId, 'Items count:', items.length);

    // Delete existing items for this customer
    const deletedCount = await BillingItem.deleteMany({ customerId });
    console.log('Deleted existing items:', deletedCount.deletedCount);

    // Add new items
    const itemsToAdd = items.map(item => ({
      ...item,
      customerId,
      price: Number(item.price) || 0,
      masterPrice: Number(item.masterPrice) || 0
    }));

    const savedItems = await BillingItem.insertMany(itemsToAdd);
    console.log('Saved new items:', savedItems.length);
    res.json({ message: 'Items updated successfully', count: savedItems.length });
  } catch (error) {
    console.error('Error bulk updating items:', error);
    res.status(400).json({ message: error.message });
  }
});

// ==================== INVENTORY ROUTES ====================

// Get all inventory items
router.get('/inventory/', async (req, res) => {
  try {
    const inventory = await BillingInventory.find().sort({ itemName: 1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Billing inventory routes removed - no longer needed

// Check inventory availability
router.post('/inventory/check-availability', async (req, res) => {
  try {
    const { items, godownId } = req.body;
    const availability = [];

    // Get godown details
    const godown = await Godown.findById(godownId);
    if (!godown) {
      return res.status(404).json({ message: 'Godown not found' });
    }

    console.log('Checking inventory for godown:', godown.name);
    console.log('Items to check:', items);

    // Import Delevery1 model from server.js (we need to access it)
    const mongoose = require('mongoose');

    // Define Delevery1 schema if not already defined
    let Delevery1;
    try {
      Delevery1 = mongoose.model('Delevery1');
    } catch (error) {
      const delevery1Schema = new mongoose.Schema({
        selectedOption: String,
        inputValue: String,
        godownName: String,
        addedAt: { type: Date, default: Date.now },
        itemName: String,
        quantity: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        masterPrice: { type: Number, default: 0 },
        description: String,
        category: String,
        godownId: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown' },
        lastUpdated: { type: Date, default: Date.now }
      });
      Delevery1 = mongoose.model('Delevery1', delevery1Schema, 'delevery1');
    }

    for (const item of items) {
      console.log(`Checking item: ${item.itemName}`);

      // Get first 3 digits as prefix for matching
      const itemPrefix = item.itemName.substring(0, 3);
      console.log(`Using prefix: ${itemPrefix} for item: ${item.itemName}`);

      // Check if item exists in delevery1 collection with matching godown using 3-digit prefix
      const delevery1Items = await Delevery1.find({
        inputValue: { $regex: `^${itemPrefix}` }, // Match items that start with the 3-digit prefix
        godownName: godown.name
      });

      console.log(`Found ${delevery1Items.length} matching items in delevery1 for prefix ${itemPrefix}`);

      // Calculate total available quantity in the selected godown
      const totalAvailableQuantity = delevery1Items.length;
      const isAvailable = totalAvailableQuantity >= item.quantity;

      // Find alternative godowns that have this item with same prefix
      const alternativeGodowns = await Delevery1.find({
        inputValue: { $regex: `^${itemPrefix}` },
        godownName: { $ne: godown.name }
      });

      // Group alternative godowns by godownName
      const alternativeGodownsGrouped = alternativeGodowns.reduce((acc, curr) => {
        if (!acc[curr.godownName]) {
          acc[curr.godownName] = {
            godownName: curr.godownName,
            availableQuantity: 0
          };
        }
        acc[curr.godownName].availableQuantity += 1;
        return acc;
      }, {});

      availability.push({
        itemName: item.itemName,
        prefix: itemPrefix,
        requestedQuantity: item.quantity,
        availableQuantity: totalAvailableQuantity,
        isAvailableInSelectedGodown: isAvailable,
        selectedGodownName: godown.name,
        status: isAvailable ? 'Available' : 'Not Available',
        message: isAvailable
          ? `✅ Item ${item.itemName} (prefix: ${itemPrefix}) available in ${godown.name}`
          : `❌ Item ${item.itemName} (prefix: ${itemPrefix}) not available in ${godown.name}`,
        alternativeGodowns: Object.values(alternativeGodownsGrouped),
        matchingItems: delevery1Items.map(di => di.inputValue)
      });
    }

    console.log('Availability results:', availability);
    res.json(availability);
  } catch (error) {
    console.error('Error checking inventory availability:', error);
    res.status(400).json({ message: error.message });
  }
});

// ==================== GODOWN ROUTES ====================

// Get items from a specific godown
router.get('/godowns/:godownId/items', async (req, res) => {
  try {
    const godownId = req.params.godownId;
    
    // Get godown details
    const godown = await Godown.findById(godownId);
    if (!godown) {
      return res.status(404).json({ message: 'Godown not found' });
    }

    // Get all items from the main inventory (since godowns don't have their own items)
    // We'll use the BillingInventory as the source
    const items = await BillingInventory.find().sort({ itemName: 1 });

    res.json({
      godown: {
        _id: godown._id,
        name: godown.name,
        city: godown.city,
        state: godown.state
      },
      items: items
    });
  } catch (error) {
    console.error('Error fetching godown items:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get godowns sorted by location matching
router.get('/godowns/sorted/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    
    // Get customer details
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get all godowns
    const allGodowns = await Godown.find().sort({ name: 1 });

    // Separate godowns by location matching
    const matchingGodowns = [];
    const nonMatchingGodowns = [];

    allGodowns.forEach(godown => {
      if (godown.city.toLowerCase() === customer.city.toLowerCase() && 
          godown.state.toLowerCase() === customer.state.toLowerCase()) {
        matchingGodowns.push(godown);
      } else {
        nonMatchingGodowns.push(godown);
      }
    });

    res.json({
      matchingGodowns,
      nonMatchingGodowns,
      customerLocation: {
        city: customer.city,
        state: customer.state
      }
    });
  } catch (error) {
    console.error('Error fetching sorted godowns:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== BILL ROUTES ====================

// Get items for a customer (for billing)
router.get('/bills/customer/:customerId/items', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    console.log('Fetching items for billing customer:', customerId);

    // Check if customerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      console.log('Invalid customer ID format:', customerId);
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }

    const items = await BillingItem.find({ customerId }).sort({ name: 1 });
    console.log('Found items for billing:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error fetching items for billing:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add new billing item for customer
router.post('/bills/customer/items/add', async (req, res) => {
  try {
    console.log('Adding new billing item:', req.body);

    const itemData = {
      name: req.body.name,
      price: req.body.price,
      masterPrice: req.body.masterPrice,
      customerId: req.body.customerId,
      srNo: Date.now().toString() // Generate a unique srNo based on timestamp
    };

    const item = new BillingItem(itemData);
    const savedItem = await item.save();
    console.log('Billing item saved successfully:', savedItem._id);

    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error adding billing item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update billing item for customer
router.put('/bills/customer/items/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const updateData = {
      name: req.body.name,
      price: req.body.price,
      masterPrice: req.body.masterPrice
    };

    const item = await BillingItem.findByIdAndUpdate(itemId, updateData, { new: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    console.log('Billing item updated successfully:', item._id);
    res.json(item);
  } catch (error) {
    console.error('Error updating billing item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete billing item for customer
router.delete('/bills/customer/items/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;

    const item = await BillingItem.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    console.log('Billing item deleted successfully:', item._id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting billing item:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get bills for a customer
router.get('/bills/customer/:customerId/bills', async (req, res) => {
  try {
    const bills = await Bill.find({ customerId: req.params.customerId })
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new bill
router.post('/bills/add', async (req, res) => {
  try {
    const { items, godownName } = req.body;

    console.log('Creating bill with items:', items);
    console.log('Godown name:', godownName);

    // Get Delevery1 model
    let Delevery1;
    try {
      Delevery1 = mongoose.model('Delevery1');
    } catch (error) {
      const delevery1Schema = new mongoose.Schema({
        selectedOption: String,
        inputValue: String,
        godownName: String,
        addedAt: { type: Date, default: Date.now },
        itemName: String,
        quantity: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        masterPrice: { type: Number, default: 0 },
        description: String,
        category: String,
        godownId: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown' },
        lastUpdated: { type: Date, default: Date.now }
      });
      Delevery1 = mongoose.model('Delevery1', delevery1Schema, 'delevery1');
    }

    // Create the bill first
    const billNumber = await generateBillNumber();
    const bill = new Bill({
      ...req.body,
      billNumber
    });
    const savedBill = await bill.save();
    console.log('Bill created successfully:', savedBill.billNumber);

    // Now delete items from delevery1 collection
    const deletionResults = [];

    for (const item of items) {
      const itemName = item.itemName;
      const requestedQuantity = item.quantity;

      console.log(`Processing item: ${itemName}, quantity: ${requestedQuantity}`);

      // Get first 3 digits as prefix for matching
      const itemPrefix = itemName.substring(0, 3);
      console.log(`Using prefix: ${itemPrefix} for item: ${itemName}`);

      // Find matching items in delevery1 collection using 3-digit prefix
      const matchingItems = await Delevery1.find({
        inputValue: { $regex: `^${itemPrefix}` }, // Match items that start with the 3-digit prefix
        godownName: godownName
      }).limit(requestedQuantity);

      console.log(`Found ${matchingItems.length} matching items in delevery1 for prefix ${itemPrefix}`);

      // Delete the found items
      const deletedItems = [];
      const deletedItemValues = [];
      for (const matchingItem of matchingItems) {
        await Delevery1.findByIdAndDelete(matchingItem._id);
        deletedItems.push(matchingItem._id);
        deletedItemValues.push(matchingItem.inputValue);
        console.log(`Deleted item with ID: ${matchingItem._id}, inputValue: ${matchingItem.inputValue}`);
      }

      deletionResults.push({
        itemName: itemName,
        prefix: itemPrefix,
        requestedQuantity: requestedQuantity,
        foundItems: matchingItems.length,
        deletedItems: deletedItems.length,
        deletedIds: deletedItems,
        deletedItemValues: deletedItemValues
      });
    }

    console.log('Deletion results:', deletionResults);

    // Return success response with deletion details
    res.status(201).json({
      ...savedBill.toObject(),
      deletionResults: deletionResults,
      message: `Bill created successfully! ${deletionResults.reduce((sum, result) => sum + result.deletedItems, 0)} items removed from inventory.`
    });

  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all bills
router.get('/bills/', async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single bill
router.get('/bills/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('customerId', 'name address gstNo phoneNumber');
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== GODOWN INVENTORY ROUTES ====================

// Initialize godown inventory
router.post('/godowns/:godownId/initialize-inventory', async (req, res) => {
  try {
    const godownId = req.params.godownId;

    // Check if godown exists
    const godown = await Godown.findById(godownId);
    if (!godown) {
      return res.status(404).json({ message: 'Godown not found' });
    }

    // Get sample inventory items from billing inventory
    const sampleItems = await BillingInventory.find().limit(10);

    let addedCount = 0;
    for (const item of sampleItems) {
      const existingItem = await GodownInventory.findOne({
        godownId: godownId,
        itemName: item.itemName
      });

      if (!existingItem) {
        const newItem = new GodownInventory({
          godownId: godownId,
          itemName: item.itemName,
          quantity: Math.floor(Math.random() * 50) + 10, // Random quantity between 10-60
          price: item.price || 0,
          masterPrice: item.masterPrice || 0,
          description: item.description || '',
          category: item.category || 'General',
          lastUpdated: Date.now()
        });
        await newItem.save();
        addedCount++;
      }
    }

    res.json({
      message: 'Godown inventory initialized successfully!',
      itemsAdded: addedCount,
      godownName: godown.name
    });
  } catch (error) {
    console.error('Error initializing godown inventory:', error);
    res.status(500).json({ message: 'Error initializing godown inventory', error: error.message });
  }
});

// Get godown inventory debug info
router.get('/godowns/:godownId/inventory-debug', async (req, res) => {
  try {
    const godownId = req.params.godownId;
    const itemName = req.query.itemName;

    // Check if godown exists
    const godown = await Godown.findById(godownId);
    if (!godown) {
      return res.status(404).json({ message: 'Godown not found' });
    }

    if (itemName) {
      // Search for specific item
      const godownItem = await GodownInventory.findOne({ godownId, itemName });
      const mainItem = await BillingInventory.findOne({ itemName });

      res.json({
        godownName: godown.name,
        searchItem: itemName,
        godownInventory: godownItem,
        mainInventory: mainItem,
        isAvailableInGodown: !!godownItem,
        godownQuantity: godownItem?.quantity || 0
      });
    } else {
      // General debug info
      const godownInventoryCount = await GodownInventory.countDocuments({ godownId });
      const mainInventoryCount = await BillingInventory.countDocuments();

      res.json({
        godownName: godown.name,
        godownInventoryCount,
        mainInventoryCount,
        message: 'Debug info retrieved successfully'
      });
    }
  } catch (error) {
    console.error('Error getting debug info:', error);
    res.status(500).json({ message: 'Error getting debug info', error: error.message });
  }
});

// Update godown inventory item
router.put('/godowns/:godownId/inventory/:itemName', async (req, res) => {
  try {
    const { godownId, itemName } = req.params;
    const { quantity } = req.body;

    // Check if godown exists
    const godown = await Godown.findById(godownId);
    if (!godown) {
      return res.status(404).json({ message: 'Godown not found' });
    }

    // Find or create the inventory item
    let inventoryItem = await GodownInventory.findOne({ godownId, itemName });

    if (inventoryItem) {
      // Update existing item
      inventoryItem.quantity += quantity;
      inventoryItem.lastUpdated = Date.now();
      await inventoryItem.save();
    } else {
      // Create new item - get details from main inventory
      const mainItem = await BillingInventory.findOne({ itemName });

      inventoryItem = new GodownInventory({
        godownId,
        itemName,
        quantity,
        price: mainItem?.price || 0,
        masterPrice: mainItem?.masterPrice || 0,
        description: mainItem?.description || '',
        category: mainItem?.category || 'General',
        lastUpdated: Date.now()
      });
      await inventoryItem.save();
    }

    res.json({
      message: 'Item added to godown inventory successfully',
      item: inventoryItem,
      godownName: godown.name
    });
  } catch (error) {
    console.error('Error updating godown inventory:', error);
    res.status(500).json({ message: 'Error updating godown inventory', error: error.message });
  }
});

module.exports = router;