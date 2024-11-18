const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController");
const authenticateToken = require("../middleware/authMiddleware");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { Template } = require("../models");
const generateUniqueSku = require("../services/skuGenerator");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dwnolb6h5",
  api_key: "143551781416216",
  api_secret: "YfkCyzpwAgVpRQHME49FS-7YMXI",
});

// Configure Multer for temporary file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage, limits: { files: 4 } });

// Route for uploading a new template with images (using Cloudinary)
// router.post(
//   "/upload",
//   authenticateToken,
//   upload.array("images", 4),
//   templateController.uploadTemplate // Use the uploadTemplate function directly
// );
router.post(
  "/upload",
  authenticateToken,
  upload.fields([
    { name: "image1" },
    { name: "image2" },
    { name: "image3" },
    { name: "image4" },
  ]),
  templateController.uploadTemplate
);
// Route to get a new SKU
router.get("/generate-sku", authenticateToken, templateController.generateSku);

// Route for fetching all templates uploaded by the designer
router.get("/", authenticateToken, templateController.getDesignerTemplates);

// Route for fetching sales data for templates
router.get("/sales-data", authenticateToken, templateController.getSalesData);

// Route to update sales count for testing
router.post("/update-sales", authenticateToken, async (req, res) => {
  const { templateId, salesCount } = req.body;

  try {
    const template = await Template.findByIdAndUpdate(
      templateId,
      { $set: { sales_count: salesCount, status: "approved" } },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json({ message: "Sales count updated successfully", template });
  } catch (error) {
    console.error("Error updating sales count:", error);
    res.status(500).json({ message: "Failed to update sales count" });
  }
});

// Route to update sales count for testing
router.post("/update-sales", authenticateToken, async (req, res) => {
  const { templateId, salesCount } = req.body;

  try {
    const template = await Template.findByIdAndUpdate(
      templateId,
      { $set: { sales_count: salesCount, status: "approved" } },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json({ message: "Sales count updated successfully", template });
  } catch (error) {
    console.error("Error updating sales count:", error);
    res.status(500).json({ message: "Failed to update sales count" });
  }
});

// Route to assign UPC code
router.put("/assign-upc", async (req, res) => {
  const { templateId, upc } = req.body;

  try {
    const template = await Template.findById(templateId);
    if (template) {
      template.upc = upc;
      await template.save();
      return res
        .status(200)
        .json({ message: "UPC assigned successfully", template });
    } else {
      return res.status(404).json({ message: "Template not found" });
    }
  } catch (error) {
    console.error("Error assigning UPC:", error);
    return res.status(500).json({ message: "Error assigning UPC" });
  }
});

// edit or update upc code

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

module.exports = router;
