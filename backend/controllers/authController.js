// controllers/authController.js
const { Designer } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY =
  "f2c36675f1b68a6a823e598d2a47e0a93c3c7a55a24d2f88d99248eb93d3e24f9cdedb21766d3ff4f6b63770f54713ad";
// Register a new designer
exports.registerDesigner = async (req, res) => {
  const {
    name,
    email,
    password,
    social,
    phone,
    payment_method,
    paypal_email,
    venmo_username,
    cashapp_username,
  } = req.body;

  try {
    // Check if designer with this email already exists
    const existingDesigner = await Designer.findOne({ email });
    if (existingDesigner) {
      console.error("Email already exists:", email);
      return res
        .status(400)
        .json({ message: "A designer with this email already exists." });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new designer
    const newDesigner = new Designer({
      name,
      email,
      password: hashedPassword,
      social,
      phone,
      payment_method,
      payment_details: { paypal_email, venmo_username, cashapp_username },
    });

    await newDesigner.save();
    res.json({ message: "Designer registration successful!" });
  } catch (error) {
    // Handle duplicate key error for `social` field
    if (error.code === 11000 && error.keyPattern && error.keyPattern.social) {
      return res.status(400).json({
        message: "The last 4 digits of Social Security must be unique.",
      });
    }
    console.error("Error registering designer:", error); // Log detailed error
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

// Login designer
exports.loginDesigner = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find designer by email
    const designer = await Designer.findOne({ email });
    if (!designer) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, designer.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: designer._id }, SECRET_KEY, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS in production
      sameSite: "lax",
      expires: new Date(Date.now() + 3600000), // Expires in 1 hour
    });
    console.log("Set token cookie:", req.cookies.token);

    // Send token in response
    res.json({ success: true, token, message: "Login successful!" });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Login failed. Please try again." });
  }
};
