const { body, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../errors/ApiError');

// Middleware to handle validation errors
const handleValidationErrors = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors to be more readable
    const formattedErrors = errors.array().map(err => ({ field: err.path, message: err.msg }));
    throw new ApiError(400, 'Validation failed', formattedErrors);
  }
  next();
});

// Validation rules for user registration
const registerValidator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required.'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  handleValidationErrors
];

// Validation rules for user login
const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  handleValidationErrors
];

module.exports = {
  registerValidator,
  loginValidator
};