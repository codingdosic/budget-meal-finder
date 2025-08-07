// backend/controllers/auth.controller.js

const AuthService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');

class AuthController {
  register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    await AuthService.register({ username, email, password });
    sendSuccess(res, { message: 'User created' }, 201);
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { token, user } = await AuthService.login(email, password);
    sendSuccess(res, {
      token,
      username: user.username,
      userId: user._id,
    });
  });
}

module.exports = new AuthController();
