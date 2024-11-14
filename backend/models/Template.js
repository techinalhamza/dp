const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Designer",
    required: true,
  },
  description: { type: String, required: true },
  sku: { type: String, required: true },
  images: [{ type: String, required: true }],
  status: {
    type: String,
    enum: ["pending", "In Progress", "Templated"],
    default: "pending",
  },
  sales_count: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  upc: { type: String, default: "Admin will assign" }, // New field for UPC code
});

const Template = mongoose.model("Template", templateSchema);
module.exports = Template;
