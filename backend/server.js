const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  console.error("❌ FATAL ERROR: JWT_SECRET is not defined in .env");
  process.exit(1);
}

// ✅ SCALABILITY: Use Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ✅ SECURITY: Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ✅ SECURITY: Middleware for Admin only
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  next();
};

// ✅ VALIDATION: Middleware to handle validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

/* ================= LOGIN ================= */
app.post("/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 4 }).withMessage("Password must be at least 4 characters")
  ],
  validateRequest,
  (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ success: false });

      if (result.length === 0) {
        return res.json({ success: false, message: "Invalid email" });
      }

      const user = result[0];

      // ✅ FIX: Prevent crash if user is Google-only
      if (user.password === "GOOGLE_USER") {
        return res.json({ success: false, message: "Please login with Google" });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.json({ success: false, message: "Wrong password" });
      }

      // ✅ SECURITY: Generate JWT
      const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

      res.json({
        success: true,
        token,
        user_id: user.id,
        role: user.role
      });
    }
  );
});

/* ================= GET USERS (For Admin Dropdown) ================= */
app.get("/users", authenticateToken, requireAdmin, (req, res) => {
  db.query("SELECT id, email FROM users WHERE role = 'user'", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ================= ADD USER (Admin Only) ================= */
app.post("/users", authenticateToken, requireAdmin,
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 4 }).withMessage("Password must be at least 4 characters")
  ],
  validateRequest,
  async (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("INSERT INTO users (email, password, role) VALUES (?, ?, 'user')", [email, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Error creating user" });
      res.json({ success: true, message: "User created successfully" });
    });
  });
});



/* ================= ADD TASK (Admin Only) ================= */
app.post("/tasks", authenticateToken, requireAdmin,
  [
    body("assigned_to").isInt().withMessage("Assigned user ID must be valid"),
    body("date").isDate().withMessage("Invalid date format (YYYY-MM-DD)"),
    body("time").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Invalid time format (HH:MM)"),
    body("description").trim().notEmpty().withMessage("Description is required")
  ],
  validateRequest,
  (req, res) => {
  const { assigned_to, date, time, description } = req.body;

  if (!assigned_to) {
    return res.status(400).json({ success: false, message: "Assigned user required" });
  }

  const sql =
    "INSERT INTO tasks (user_id, date, time, description, status) VALUES (?,?,?,?, 'pending')";

  db.query(sql, [assigned_to, date, time, description], (err, result) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

/* ================= GET TASKS ================= */
app.get("/tasks", authenticateToken, (req, res) => {
  let sql;
  let params = [];

  if (req.user.role === "admin") {
    // Admin sees ALL tasks with assignee info
    sql = "SELECT t.*, u.email as assigned_user FROM tasks t JOIN users u ON t.user_id = u.id ORDER BY date, time";
  } else {
    // User sees ONLY their tasks
    sql = "SELECT * FROM tasks WHERE user_id = ? ORDER BY date, time";
    params = [req.user.id];
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ================= COMPLETE TASK ================= */
app.put("/tasks/:id/complete", authenticateToken, (req, res) => {
  // Allow Admin or the Task Owner to complete
  const sql = req.user.role === 'admin' 
    ? "UPDATE tasks SET status='completed' WHERE id=?"
    : "UPDATE tasks SET status='completed' WHERE id=? AND user_id=?";
    
  const params = req.user.role === 'admin' ? [req.params.id] : [req.params.id, req.user.id];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ success: false });
    if (result.affectedRows === 0) return res.status(403).json({ success: false, message: "Unauthorized" });
    res.json({ success: true });
  });
});

// 📊 Dashboard counts API
app.get("/dashboard/counts", authenticateToken, (req, res) => {
  let sql;
  let params = [];

  if (req.user.role === "admin") {
    sql = `SELECT COUNT(*) AS total, SUM(status = 'completed') AS completed, SUM(status = 'pending') AS pending FROM tasks`;
  } else {
    sql = `SELECT COUNT(*) AS total, SUM(status = 'completed') AS completed, SUM(status = 'pending') AS pending FROM tasks WHERE user_id = ?`;
    params = [req.user.id];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Dashboard count error:", err);
      return res.status(500).json({ error: "DB error" });
    }

    res.json(results[0]);
  });
});

/* ================= DELETE TASK ================= */
app.delete("/tasks/:id", authenticateToken, requireAdmin, (req, res) => {
  db.query("DELETE FROM tasks WHERE id=?", [req.params.id], err => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

app.post("/google-login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("google_id").notEmpty().withMessage("Google ID is required")
  ],
  validateRequest,
  (req, res) => {
  const { email, google_id } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.error("Google Login DB Error:", err);
      return res.status(500).json({ success: false, message: "Database error checking user" });
    }

    // User already exists
    if (result.length > 0) {
      const user = result[0];
      const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
      return res.json({ success: true, token, user_id: user.id, role: user.role });
    }

    // New Google user
    db.query(
      "INSERT INTO users (email, google_id, password) VALUES (?, ?, ?)",
      [email, google_id, "GOOGLE_USER"],
      (err, insertResult) => {
        if (err) {
          console.error("Google Login Insert Error:", err);
          return res.status(500).json({ success: false, message: "Database error creating user" });
        }

        const newUser = { id: insertResult.insertId, role: "user" };
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ success: true, token, user_id: newUser.id, role: newUser.role });
      }
    );
  });
});



app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
  console.log("✅ Successfully connected to MySQL database");
});