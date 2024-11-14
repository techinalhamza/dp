// routes/designerRoutes.js
const express = require("express");
const router = express.Router();
const designerController = require("../controllers/designerController");
const authenticateToken = require("../middleware/authMiddleware");

// Route to get designer profile (requires authentication)
router.get("/profile", authenticateToken, designerController.getProfile);

// Route for updating payment information
router.put(
  "/update-payment-info",
  authenticateToken,
  designerController.updatePaymentInfo
);

// Route to get designer stats for dashboard
router.get("/stats", authenticateToken, designerController.getStats);
router.get(
  "/sales-chart",
  authenticateToken,
  designerController.getSalesChartData
);

// Route for updating payment information
router.put(
  "/update-payment-info",
  authenticateToken,
  designerController.updatePaymentInfo
);

module.exports = router;
