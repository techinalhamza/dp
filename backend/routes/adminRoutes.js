const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authenticateAdmin = require("../middleware/authAdmin");
const templateController = require("../controllers/templateController");
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

// // routes/adminRoutes.js
// const express = require("express");
// const router = express.Router();
// const adminController = require("../controllers/adminController");
// const authenticateAdmin = require("../middleware/authAdmin");

// // Ensure adminController is correctly imported and defined
// if (!adminController || typeof adminController.getOverview !== "function") {
//   console.error("Error: adminController.getOverview is not defined.");
// }

// // Admin login route
// router.post("/login", adminController.loginAdmin);
// router.get("/overview", authenticateAdmin, adminController.getOverview);
// router.get("/designers", authenticateAdmin, adminController.getAllDesigners);
// router.get(
//   "/approved-templates",
//   authenticateAdmin,
//   adminController.getApprovedTemplates
// );
// // Route for viewing pending templates
// router.get(
//   "/pending-templates",
//   authenticateAdmin,
//   adminController.getPendingTemplates
// );

// // Route to approve a template
// router.put(
//   "/approve-template/:id",
//   authenticateAdmin,
//   adminController.approveTemplate
// );

// // Route to reject a template
// router.put(
//   "/reject-template/:id",
//   authenticateAdmin,
//   adminController.rejectTemplate
// );

// // Route to view all approved templates
// // router.get(
// //   "/approved-templates",
// //   authenticateAdmin,
// //   adminController.getApprovedTemplates
// // );

// // Route to get dashboard statistics
// router.get(
//   "/dashboard-stats",
//   authenticateAdmin,
//   adminController.getDashboardStats
// );

// module.exports = router;
