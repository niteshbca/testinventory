const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/mernAuth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Schema and Model for delevery1 Collection
const delevery1Schema = new mongoose.Schema({
  selectedOption: String,
  inputValue: String,
  godownName: String,
});

const Delevery1 = mongoose.model("delevery1", delevery1Schema);

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

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
