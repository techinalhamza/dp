// shopifyRoutes.js
const express = require("express");
const router = express.Router();
const { handleShopifyWebhook } = require("../controllers/shopifyController");

// Route to handle Shopify webhooks
router.post("/orders", express.json(), handleShopifyWebhook);

module.exports = router;
