require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5001;

const Godown = require('./models/Godowns');
const GodownInventory = require('./models/GodownInventory');
const excelRoutes = require('./routes/excelRoutes');
const billingRoutes = require('./routes/billingRoutes');

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Schemas and Models
const itemSchema = new mongoose.Schema({
  godownId: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown', required: true },
  name: { type: String, required: true },
});
const Item = mongoose.model('Item', itemSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

const deliveryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  godown: { type: String, required: true },
});
const DeliveryItem = mongoose.model('DeliveryItem', deliveryItemSchema);

const saleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  godown: { type: String, required: true },
});

const Sale = mongoose.model('Sale', saleSchema);


// Schema for Select Collection
const selectSchema = new mongoose.Schema({
  inputValue: String,
});

const Select = mongoose.model("Select", selectSchema);



// Define Schema
const barcodeSchema = new mongoose.Schema({
  product: String,
  packed: String,
  batch: String,
  shift: String,
  numberOfBarcodes: Number,
  location: String,
  currentTime: String,
  rewinder: String,
  edge: String,
  winder: String,
  mixer: String,
  skuc: String,
  skun: String,
  batchNumbers: [Number],
});

// Create Model
const Barcode = mongoose.model("Barcode", barcodeSchema);




// Routes




const despatchSchema = new mongoose.Schema({
  selectedOption: String,
  inputValue: String,
  godownName: String, // Godown name add kiya
  addedAt: { type: Date, default: Date.now },
});



const Despatch = mongoose.model("Despatch", despatchSchema, "despatch"); // `despatch` collection

// Schema for Select Collection





const delevery1Schema = new mongoose.Schema({
  selectedOption: String,
  inputValue: String,
  godownName: String,
  addedAt: { type: Date, default: Date.now },
  // Additional fields for billing system integration
  itemName: String,
  quantity: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  masterPrice: { type: Number, default: 0 },
  description: String,
  category: String,
  godownId: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown' },
  lastUpdated: { type: Date, default: Date.now }
});


const Delevery1 = mongoose.model("Delevery1", delevery1Schema, "delevery1");




const dsaleSchema = new mongoose.Schema({
  selectedOption: String,
  inputValue: String,
  godownName: String,
  username: String,             // Added username
  mobileNumber: String,          // Added mobile number
  addedAt: { type: Date, default: Date.now },
});

// Define Models

const Dsale = mongoose.model("Dsale", dsaleSchema, "dsale");


// API Routes



//const barcodeSchema = new mongoose.Schema({}, { strict: false });
//const Barcode = mongoose.model("Barcode", barcodeSchema);

app.get("/api/barcodes", async (req, res) => {
  try {
    const barcodes = await Barcode.find();
    res.json(barcodes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
});

// Godown API
app.get('/api/godowns', async (req, res) => {
  try {
    const godowns = await Godown.find();
    res.json(godowns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/godowns', async (req, res) => {
  try {
    const { name, address, email, password, city, state } = req.body;
    const godown = new Godown({ name, address, email, password, city, state });
    const savedGodown = await godown.save();
    res.status(201).json(savedGodown);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ message: 'Email already exists (duplicate)' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Add PUT endpoint for editing godown
app.put('/api/godowns/:id', async (req, res) => {
  try {
    const { name, address, email, password, city, state } = req.body;
    const updatedGodown = await Godown.findByIdAndUpdate(
      req.params.id,
      { name, address, email, password, city, state },
      { new: true, runValidators: true }
    );
    if (!updatedGodown) return res.status(404).json({ message: 'Godown not found' });
    res.json(updatedGodown);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ message: 'Email already exists (duplicate)' });
    }
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/godowns/:id', async (req, res) => {
  try {
    const godown = await Godown.findByIdAndDelete(req.params.id);
    if (!godown) return res.status(404).json({ message: 'Godown not found' });
    res.json({ message: 'Godown deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Godown Inventory API Endpoints are now in billingRoutes.js

// Item API
app.get('/api/items/:godownId', async (req, res) => {
  try {
    const items = await Item.find({ godownId: req.params.godownId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { godownId, name } = req.body;
    const item = new Item({ godownId, name });
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delivery Items API
app.post('/api/checkAndAddItem', async (req, res) => {
  const { input, godownName } = req.body;

  try {
    const item = await Item.findOne({ name: input });

    if (item) {
      const newDeliveryItem = new DeliveryItem({ name: input, godown: godownName });
      await newDeliveryItem.save();
      res.json({ success: true, message: 'Item added successfully!' });
    } else {
      res.json({ success: false, message: 'No matching item found in the database.' });
    }
  } catch (error) {
    console.error('Error in checkAndAddItem API:', error);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again.', error: error.message });
  }
});

app.get('/api/getDeliveryItems', async (req, res) => {
  const godownName = req.query.godown;

  if (!godownName) {
    return res.status(400).json({ success: false, message: 'Godown name is required.' });
  }

  try {
    const deliveryItems = await DeliveryItem.find({ godown: godownName });

    if (deliveryItems.length === 0) {
      return res.json({ success: false, message: 'No delivery items found for this godown.' });
    }

    res.json({ success: true, data: deliveryItems });
  } catch (error) {
    console.error('Error fetching delivery items:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching data.' });
  }
});

// User Authentication API
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login Route
app.post('/loginadmin', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

// Godown Login Validation
app.post('/api/login', async (req, res) => {
  const { name, address } = req.body;
  try {
    const godown = await Godown.findOne({ name, address });
    if (godown) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.json({ success: false, message: 'Invalid Godown Name or Address' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Godown Login with Email and Password
app.post('/api/godown-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const godown = await Godown.findOne({ email, password });
    if (godown) {
      res.json({ 
        success: true, 
        message: 'Login successful',
        godown: {
          _id: godown._id,
          name: godown.name,
          address: godown.address,
          email: godown.email,
          city: godown.city,
          state: godown.state
        }
      });
    } else {
      res.json({ success: false, message: 'Invalid Email or Password' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User List API
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Deletion API
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all delivery items
app.get('/api/deliveryItems', async (req, res) => {
  try {
    const items = await DeliveryItem.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching delivery items' });
  }
});

// Add item to sales if it matches deliveryItems
app.post('/api/sales', async (req, res) => {
  const { name, userName, mobileNumber, godown } = req.body;

  try {
    // Check if the item exists in the deliveryItems collection
    const matchingItem = await DeliveryItem.findOne({ name: name.trim() });

    if (!matchingItem) {
      return res.status(400).json({ error: 'Item name does not exist in delivery items.' });
    }

    // Add the item to the sales collection
    const sale = new Sale({ name, userName, mobileNumber, godown });
    await sale.save();

    // Delete the item from the deliveryItems collection
    await DeliveryItem.findByIdAndDelete(matchingItem._id);

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: 'Error processing the sale' });
  }
});

// Delete item from delivery items
app.delete('/api/deliveryItems/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await DeliveryItem.findByIdAndDelete(id);
    res.status(200).json({ message: 'Item deleted from delivery items' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting item from delivery items' });
  }
});

// Get all sales grouped by godown
app.get('/api/sales', async (req, res) => {
  try {
    const salesData = await Sale.aggregate([
      { $group: { _id: "$godown", sales: { $push: "$$ROOT" } } }
    ]);
    res.status(200).json(salesData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sales data' });
  }
});




// Routes

// Get All Data from 'datas' collection
app.get('/selects', async (req, res) => {
  try {
      const data = await Select.find();
      res.json(data);
  } catch (err) {
      res.status(500).send("Error fetching data");
  }
});


// API to fetch unique products for dropdown
app.get("/api/products", async (req, res) => {
  try {
    const products = await Barcode.distinct("product"); // Unique products only
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// API to save input field data in 'select' collection
app.post("/api/save", async (req, res) => {
  try {
    const { inputValue } = req.body;
    if (!inputValue) {
      return res.status(400).json({ message: "Input value is required" });
    }

    const newEntry = new Select({ inputValue });
    await newEntry.save();

    res.json({ message: "Data saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving data" });
  }
});

// API to save only input value (for SelectForm) - now same as /api/save
app.post("/api/save-input", async (req, res) => {
  try {
    const { inputValue } = req.body;
    if (!inputValue) {
      return res.status(400).json({ message: "Input value is required" });
    }

    const newEntry = new Select({ inputValue });
    await newEntry.save();

    res.json({ message: "Data saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving data" });
  }
});


// API: Get All Select Options
app.get("/api/products1", async (req, res) => {
  try {
    const products = await Select.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// API: Add Data After Checking Match & Delete from `selects`
app.post("/api/save/select", async (req, res) => {
  const { inputValue, godownName } = req.body;

  try {
    const existingData = await Select.findOne({ inputValue });

    if (!existingData) {
      return res.status(400).json({ message: "No matching data found in selects" });
    }

    // Save to `despatch` collection with godown name
    const newDespatch = new Despatch({ selectedOption: "default", inputValue, godownName });
    await newDespatch.save();

    // Delete from `selects` collection after adding
    await Select.deleteOne({ _id: existingData._id });

    res.json({ message: "Data saved in despatch and deleted from selects" });
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});


// API to save data
app.post("/api/saved", async (req, res) => {
  try {
    const newBarcode = new Barcode(req.body);
    await newBarcode.save();
    res.json({ message: "Data saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});




// API: Get All Despatch Options
app.get("/api/products2", async (req, res) => {
  try {
    const products = await Despatch.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// API: Add Data After Checking Match & Delete from `despatch`
app.post("/api/save/despatch", async (req, res) => {
  const { selectedOption, inputValue, godownName } = req.body;

  try {
    const existingData = await Despatch.findOne({ selectedOption, inputValue });

    if (!existingData) {
      return res.status(400).json({ message: "No matching data found in despatch" });
    }

    // Save to `delevery1` collection with godown name
    const newDelevery1 = new Delevery1({ selectedOption, inputValue, godownName });
    await newDelevery1.save();

    // Delete from `despatch` collection after adding
    await Despatch.deleteOne({ _id: existingData._id });

    res.json({ message: "Data saved in delevery1 and deleted from despatch" });
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});


// API Route to get data
app.get('/api/despatch', async (req, res) => {
  try {
      const data = await Despatch.find({});
      console.log("Data Fetched: ", data);  // Debugging: Check data in console
      res.json(data);
  } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Failed to fetch data' });
  }
});


// API to fetch data from delevery1 Collection
app.get("/api/delevery1", async (req, res) => {
  try {
    const data = await Delevery1.find();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data" });
  }
});


// API: Get All Data from `delevery1`
app.get("/api/products3", async (req, res) => {
  try {
    const products = await Delevery1.find(); // Fetching from `delevery1`
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// API: Add Data to `delevery1`
app.post("/api/add/delevery1", async (req, res) => {
  const { selectedOption, inputValue, godownName, username, mobileNumber } = req.body;
  console.log("Request Body:", req.body); // Debugging line

  try {
    const newDelevery1 = new Delevery1({ selectedOption, inputValue, godownName, username, mobileNumber });
    await newDelevery1.save();
    res.json({ message: "Data added to delevery1" });
  } catch (error) {
    res.status(500).json({ message: "Error adding data", error });
  }
});

// API: Add Data After Checking Match & Delete from `delevery1`
app.post("/api/save/delevery1", async (req, res) => {
  const { selectedOption, inputValue, godownName, username, mobileNumber } = req.body;

  try {
    // Check if matching data exists in `delevery1`
    const existingData = await Delevery1.findOne({ selectedOption, inputValue });

    if (!existingData) {
      return res.status(400).json({ message: "No matching data found in delevery1" });
    }

    // Save to `dsale` collection with godown name, username, and mobile number
    const newDsale = new Dsale({ selectedOption, inputValue, godownName, username, mobileNumber });
    await newDsale.save();

    // Delete from `delevery1` collection after adding to `dsale`
    await Delevery1.deleteOne({ _id: existingData._id });

    res.json({ message: "Data saved in dsale and deleted from delevery1" });
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});

// Get all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await Dsale.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// API to save multiple select + input field data in 'select' collection
app.post("/api/save-multiple", async (req, res) => {
  try {
    const { selectedOption, values } = req.body;
    if (!selectedOption || !Array.isArray(values) || values.length === 0) {
      return res.status(400).json({ message: "Product and values are required" });
    }
    // Save all values
    const entries = values.map(inputValue => ({ selectedOption, inputValue }));
    await Select.insertMany(entries);
    res.json({ message: "All values saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving values", error });
  }
});

app.use('/api', excelRoutes);
app.use('/api', billingRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
