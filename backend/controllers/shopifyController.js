const { Template } = require("../models");
const crypto = require("crypto");

const SHOPIFY_WEBHOOK_SECRET =
  "5345a85108adc0a0389e25d0523e0c31fc284c5eafea7c2ec95c83a2476cc3b3"; // Your actual secret key

// Function to verify Shopify webhook signature
const verifyShopifySignature = (req) => {
  const hmac = req.headers["x-shopify-hmac-sha256"];
  if (!hmac) {
    console.error("Missing HMAC header");
    return false;
  }

  // Use the raw body from req.rawBody
  const rawBody = req.rawBody;
  if (!rawBody) {
    console.error("Missing raw body for HMAC verification");
    return false;
  }

  // Generate the HMAC using the raw body
  const generatedHmac = crypto
    .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("base64");

  console.log("HMAC from Shopify:", hmac);
  console.log("Generated HMAC:", generatedHmac);

  return crypto.timingSafeEqual(
    Buffer.from(hmac, "utf8"),
    Buffer.from(generatedHmac, "utf8")
  );
};

// Handle the Shopify webhook
exports.handleShopifyWebhook = async (req, res) => {
  try {
    if (!verifyShopifySignature(req)) {
      console.error("Unauthorized: Invalid Shopify signature");
      return res.status(401).send("Unauthorized: Invalid Shopify signature");
    }

    console.log("Webhook received:", req.body);
    console.log("Raw Body:", req.rawBody);
    console.log("Parsed Body:", req.body);
    console.log("Raw Body Length:", Buffer.byteLength(req.rawBody));
    console.log(
      "Parsed Body Length:",
      Buffer.byteLength(JSON.stringify(req.body))
    );

    const { line_items } = req.body;
    for (const item of line_items) {
      const sku = item.sku;
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
