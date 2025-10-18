// backend/controllers/auth.controller.js

const AuthService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');

class AuthController {
  register = asyncHandler(async (req, res) => {
    const user = await AuthService.register(req.body);
    sendSuccess(res, user, 201);
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    sendSuccess(res, result);
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.resetPassword(email);
    sendSuccess(res, result);
  });
}

module.exports = new AuthController();
