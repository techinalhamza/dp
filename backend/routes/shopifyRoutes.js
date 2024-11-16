const express = require("express");
const router = express.Router();
const { handleShopifyWebhook } = require("../controllers/shopifyController");

router.post("/orders", express.json(), handleShopifyWebhook);

module.exports = router;
