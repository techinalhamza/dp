// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.registerDesigner);
router.post("/login", authController.loginDesigner); // Add login route

module.exports = router;
