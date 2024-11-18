const { Template, Designer } = require("../models");
const crypto = require("crypto");
const sendEmail = require("../services/emailService");
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET; // Your actual secret key

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
        // Notify the designer via email
        const designer = await Designer.findById(template.designerId);
        if (designer && designer.email) {
          const subject = "🎉 Your Template Just Got Sold!";
          const html = `
            <h2>Congratulations ${designer.name}!</h2>
            <p>Your template with SKU: <b>${sku}</b> was just sold.</p>
            <p>Total Sales Count: ${template.sales_count}</p>
            <p>Keep up the great work!</p>
          `;

          await sendEmail(designer.email, subject, html);
          console.log(`Email sent to designer: ${designer.email}`);
        }
      }
    }

    res.status(200).send("Webhook processed successfully");
  } catch (error) {
    console.error("Error handling Shopify webhook:", error);
    res.status(500).send("Error processing webhook");
  }
};
