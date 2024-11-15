const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authenticateAdmin = require("../middleware/authAdmin");
const templateController = require("../controllers/templateController");
const { assignUpc } = require("../controllers/templateController");

// Admin login
router.post("/login", adminController.loginAdmin);

// Dashboard overview
router.get("/overview", authenticateAdmin, adminController.getOverview);

// Get all designers
router.get("/designers", authenticateAdmin, adminController.getAllDesigners);

router.get("/templates", authenticateAdmin, adminController.getAllTemplates);

// View pending templates
router.get(
  "/pending-templates",
  authenticateAdmin,
  adminController.getPendingTemplates
);

// Approve and reject templates
router.put(
  "/approve-template/:id",
  authenticateAdmin,
  adminController.approveTemplate
);
router.put(
  "/reject-template/:id",
  authenticateAdmin,
  adminController.rejectTemplate
);
// Route to get sales data
router.get("/sales", authenticateAdmin, adminController.getSalesData);
router.get(
  "/sales-chart",
  authenticateAdmin,
  adminController.getSalesChartData
);
router.get("/payments", authenticateAdmin, adminController.getPayments);
// Route to assign UPC code
router.put("/assign-upc", authenticateAdmin, templateController.assignUpc);
// Route to update the UPC code
router.put("/edit-upc", authenticateAdmin, templateController.updateUpcCode);

// Route to fetch templates that need UPC assignment
router.get(
  "/pending-upc",
  authenticateAdmin,
  templateController.getPendingTemplatesForUPC
);
// Route to update status
router.put(
  "/update-status",
  authenticateAdmin,
  templateController.updateTemplateStatus
);

module.exports = router;
