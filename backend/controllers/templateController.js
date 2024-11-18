const { Template } = require("../models");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Notification = require("../models/Notification");
const generateUniqueSku = require("../services/skuGenerator");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dwnolb6h5",
  api_key: "143551781416216",
  api_secret: "YfkCyzpwAgVpRQHME49FS-7YMXI",
});

exports.uploadTemplate = async (req, res) => {
  const { description, hiddenSku } = req.body;

  // Check if files were uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files were uploaded." });
  }

  const images = [];
  const uploadedFiles = req.files.map((file) => file.path); // Track uploaded file paths

  try {
    // Upload each image to Cloudinary
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "templates",
      });
      images.push(result.secure_url);
    }

    // Use the SKU sent from the frontend, or generate a new one if not provided
    const sku = hiddenSku || (await generateUniqueSku());

    // Save the template to the database with Cloudinary URLs
    const template = new Template({
      designerId: req.user.id,
      description,
      sku, // Use the provided SKU
      images,
      status: "pending",
    });

    await template.save();
    res
      .status(201)
      .json({ message: "Template uploaded successfully", template });
  } catch (error) {
    console.error("Error uploading template:", error);
    res.status(500).json({ message: "Template upload failed" });
  } finally {
    // Always remove uploaded files from the local server
    uploadedFiles.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      }
    });
  }
};

// Get templates by designer
exports.getDesignerTemplates = async (req, res) => {
  try {
    const designerId = req.user.id;

    // Fetch all templates for the current designer
    const templates = await Template.find({ designerId }).select(
      "description images sku status sales_count createdAt upc"
    );

    // Calculate earnings for each template
    const pricePerTemplate = 100;
    const commissionRate = 0.3;

    const templatesWithEarnings = templates.map((template) => ({
      ...template._doc,
      earnings: template.sales_count * pricePerTemplate * commissionRate,
    }));

    res.json(templatesWithEarnings);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).send("Error fetching templates.");
  }
};

// Get total revenue and detailed sales data for each template
exports.getSalesData = async (req, res) => {
  const COMMISSION_RATE = 0.3; // 30% commission rate
  const PRICE_PER_TEMPLATE = 100; // Example price per template sale

  try {
    const templates = await Template.find({
      designerId: req.user.id,
      status: "approved",
    }).select("sku sales_count description images createdAt");

    let totalRevenue = 0;

    const templatesWithEarnings = templates.map((template) => {
      const earnings =
        template.sales_count * PRICE_PER_TEMPLATE * COMMISSION_RATE;
      totalRevenue += earnings;
      return {
        ...template.toObject(),
        earnings,
      };
    });

    res.json({ totalRevenue, templates: templatesWithEarnings });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ message: "Error fetching sales data." });
  }
};

// Notify designer on template approval
const notifyDesigner = async (designerId, message, type) => {
  await Notification.create({ designerId, message, type });
};
// Function to update the status of a template
exports.updateTemplateStatus = async (req, res) => {
  const { templateId, status } = req.body;

  try {
    // Fetch the template from the database
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Update the status
    template.status = status;
    await template.save();

    // Notify designer based on the updated status
    if (template.status === "approved") {
      await notifyDesigner(
        template.designerId,
        "Your template has been approved!",
        "approval"
      );
    } else if (template.status === "rejected") {
      await notifyDesigner(
        template.designerId,
        "Your template has been rejected.",
        "rejection"
      );
    }

    res.json({ message: "Template status updated successfully" });
  } catch (error) {
    console.error("Error updating template status:", error);
    res.status(500).json({ message: "Failed to update template status" });
  }
};

/// Assign or update UPC in templateController.js
exports.assignUpc = async (req, res) => {
  const { templateId, upc } = req.body;

  try {
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Assign or update the UPC
    template.upc = upc;
    template.status = "approved"; // Make sure status updates to 'approved'
    await template.save();

    return res
      .status(200)
      .json({ message: "UPC assigned successfully", template });
  } catch (error) {
    console.error("Error assigning UPC:", error);
    return res.status(500).json({ message: "Error assigning UPC" });
  }
};

// Get all templates that require a UPC assignment
exports.getPendingTemplatesForUPC = async (req, res) => {
  try {
    const templates = await Template.find({
      status: "Templated",
      upcCode: { $exists: false },
    });
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates needing UPC:", error);
    res.status(500).json({ message: "Error fetching templates." });
  }
};

// templateController.js

exports.updateUpcCode = async (req, res) => {
  const { templateId, newUpc } = req.body;

  if (!newUpc || !templateId) {
    return res
      .status(400)
      .json({ message: "UPC and template ID are required" });
  }

  try {
    // Find the template by ID
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Update the UPC code
    template.upc = newUpc;
    await template.save();

    return res
      .status(200)
      .json({ message: "UPC updated successfully", template });
  } catch (error) {
    console.error("Error updating UPC:", error);
    return res.status(500).json({ message: "Failed to update UPC" });
  }
};
