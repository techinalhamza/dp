const jwt = require("jsonwebtoken");
const SECRET_KEY =
  "f2c36675f1b68a6a823e598d2a47e48eb93d3e24f9cdedb21766d3ff4f6b63770f54713ad0a93c3c7a55a24d2f88d992";

const authenticateAdmin = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    console.error("Invalid token:", error);
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = authenticateAdmin;
