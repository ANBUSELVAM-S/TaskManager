const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  console.error("❌ JWT_SECRET missing in .env");
  process.exit(1);
}

// 🔐 Verify JWT
const authenticateToken = (req, res, next) => {
  console.log("✅ Auth Middleware Running");
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided."
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token."
      });
    }

    req.user = decoded;
    next();
  });
};

// 👑 Admin Only Middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admins only."
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };