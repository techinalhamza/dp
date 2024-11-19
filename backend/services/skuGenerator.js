const { Template } = require("../models");

async function generateUniqueSku() {
  const prefix = "RNZ ";
  let sku;

  while (true) {
    const randomNumber = Math.floor(100 + Math.random() * 900);
    sku = `${prefix}${randomNumber}`;
    const existingTemplate = await Template.findOne({ sku });
    if (!existingTemplate) break;
  }

  return sku;
}

module.exports = generateUniqueSku;
