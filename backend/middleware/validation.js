const { body, validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

const loginRules = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters"),
];

const addUserRules = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters"),
];

const addTaskRules = [
  body("assigned_to")
    .isInt()
    .withMessage("Assigned user ID must be valid"),
  body("date")
    .isISO8601()
    .withMessage("Invalid date format (YYYY-MM-DD)"),
  body("time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (HH:MM)"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),
  // ✅ IMPROVEMENT: Add validation for the priority field.
  body("priority")
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage("Invalid priority value. Must be 'low', 'medium', or 'high'."),
];

const googleLoginRules = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("google_id").notEmpty().withMessage("Google ID is required"),
];

module.exports = {
  validateRequest,
  loginRules,
  addUserRules,
  addTaskRules,
  googleLoginRules,
};