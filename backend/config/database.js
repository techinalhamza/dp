// database.js
const mongoose = require("mongoose");

const mongoURI =
  "mongodb+srv://techinalhamza:techinalhamza@cluster0.3ycbz.mongodb.net";
// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

module.exports = mongoose;
