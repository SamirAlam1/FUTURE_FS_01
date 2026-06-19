// middleware/validate.js
// FIX: Centralized input validation using express-validator (already in package.json)
// Apply to routes: router.post('/', validateMessage, route_handler)

const { body, param, validationResult } = require('express-validator');

// ─── Validation result checker ───────────────────────────────────────────────
// Always use this as the last item in a validation chain
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth validators ─────────────────────────────────────────────────────────
const validateLogin = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .trim(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .trim(),
  handleValidation,
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
  handleValidation,
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters')
    .escape(),
  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  handleValidation,
];

// ─── Message (contact form) validators ──────────────────────────────────────
const validateMessage = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters')
    .escape(),                       // FIX: HTML-encode to prevent XSS
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .trim(),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ min: 3, max: 200 }).withMessage('Subject must be 3–200 characters')
    .escape(),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10–2000 characters')
    .escape(),
  handleValidation,
];

// ─── Project validators ───────────────────────────────────────────────────────
const validateProject = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title max 100 chars')
    .escape(),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description max 1000 chars')
    .escape(),
  body('techStack')
    .isArray({ min: 1 }).withMessage('Tech stack must be a non-empty array'),
  body('techStack.*')
    .trim().escape(),
  body('liveUrl')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Live URL must be a valid URL'),
  body('githubUrl')
    .optional({ checkFalsy: true })
    .isURL().withMessage('GitHub URL must be a valid URL'),
  body('imageUrl')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Image URL must be a valid URL'),
  handleValidation,
];

// ─── Skill validators ─────────────────────────────────────────────────────────
const validateSkill = [
  body('name')
    .trim()
    .notEmpty().withMessage('Skill name is required')
    .isLength({ max: 50 }).withMessage('Skill name max 50 chars')
    .escape(),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['Frontend', 'Backend', 'Database', 'Tools', 'Currently Learning'])
    .withMessage('Invalid category'),
  body('level')
    .isInt({ min: 0, max: 100 }).withMessage('Level must be 0–100'),
  handleValidation,
];

// ─── Education validators ─────────────────────────────────────────────────────
const validateEducation = [
  body('institution')
    .trim()
    .notEmpty().withMessage('Institution is required')
    .isLength({ max: 200 }).withMessage('Max 200 chars')
    .escape(),
  body('degree')
    .trim()
    .notEmpty().withMessage('Degree is required')
    .escape(),
  body('startYear')
    .isInt({ min: 1990, max: 2100 }).withMessage('Invalid start year'),
  body('endYear')
    .optional({ checkFalsy: true })
    .isInt({ min: 1990, max: 2100 }).withMessage('Invalid end year'),
  handleValidation,
];

// ─── Blog validators ──────────────────────────────────────────────────────────
const validateBlog = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title max 200 chars')
    .escape(),
  body('excerpt')
    .trim()
    .optional()
    .isLength({ max: 500 }).withMessage('Excerpt max 500 chars')
    .escape(),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),
  // Note: Do NOT .escape() on content — it's rich text/markdown
  // Instead sanitize with DOMPurify on the frontend before rendering
  body('published')
    .optional()
    .isBoolean().withMessage('Published must be boolean'),
  handleValidation,
];

// ─── MongoDB ObjectId param validator ────────────────────────────────────────
const validateObjectId = [
  param('id')
    .matches(/^[0-9a-fA-F]{24}$/).withMessage('Invalid ID format'),
  handleValidation,
];

module.exports = {
  validateLogin,
  validateChangePassword,
  validateUpdateProfile,
  validateMessage,
  validateProject,
  validateSkill,
  validateEducation,
  validateObjectId,
};
