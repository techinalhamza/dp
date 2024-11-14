// models/Designer.js
const mongoose = require("mongoose");

const designerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  social: { type: String, required: true, unique: true }, // Added unique constraint here
  phone: String,
  payment_method: String,
  payment_details: {
    paypal_email: String,
    venmo_username: String,
    cashapp_username: String,
  },
});

module.exports = mongoose.model("Designer", designerSchema);
