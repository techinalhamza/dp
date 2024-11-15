// shopifyController.js
const { Template } = require("../models");
const crypto = require("crypto");

// Shopify webhook secret key (get this from your Shopify admin panel)
const SHOPIFY_WEBHOOK_SECRET =
  "5345a85108adc0a0389e25d0523e0c31fc284c5eafea7c2ec95c83a2476cc3b3";

// Function to verify the Shopify webhook signature
const verifyShopifySignature = (req) => {
  const hmac = req.headers["x-shopify-hmac-sha256"];
  const body = JSON.stringify(req.body);
  const generatedHmac = crypto
    .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(hmac || "", "utf8"),
    Buffer.from(generatedHmac, "utf8")
  );
};

// Handle Shopify webhook
exports.handleShopifyWebhook = async (req, res) => {
  try {
    // Verify the Shopify webhook signature
    if (!verifyShopifySignature(req)) {
      console.error("Unauthorized: Invalid Shopify signature");
      return res.status(401).send("Unauthorized: Invalid Shopify signature");
    }

    console.log("Webhook received:", req.body);

    const { line_items } = req.body;

    // Process each line item
    for (const item of line_items) {
      const sku = item.sku;

      // Find the template by SKU and update sales count
      const template = await Template.findOne({ sku });
      if (template) {
        template.sales_count += item.quantity;
        await template.save();
        console.log(`Updated sales for SKU: ${sku}`);
      }
    }

    res.status(200).send("Webhook processed successfully");
  } catch (error) {
    console.error("Error handling Shopify webhook:", error);
    res.status(500).send("Error processing webhook");
  }
};
