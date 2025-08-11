// backend/controllers/auth.controller.js

const AuthService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');

class AuthController {

  // asyncHandler로 래핑하여 비동기 함수 처리
  register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // 비동기 서비스 호출
    await AuthService.register({ username, email, password });

    // 성공 응답 전송
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
