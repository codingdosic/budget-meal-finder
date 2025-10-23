// backend/controllers/auth.controller.js

const AuthService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');

class AuthController {

  // 가입 요청 서비스로 위임 후 응답 반환
  register = asyncHandler(async (req, res) => {
    const user = await AuthService.register(req.body);
    sendSuccess(res, user, 201);
  });

  // 관리자 가입 요청 서비스로 위임 후 응답 반환
  registerAdmin = asyncHandler(async (req, res) => {
    const user = await AuthService.registerAdmin(req.body);
    sendSuccess(res, user, 201);
  });

  // 로그인 요청 서비스로 위임 후 응답 반환
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    sendSuccess(res, result);
  });

  // 비밀번호 초기화 요청 서비스로 위임 후 응답 반환
  resetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.resetPassword(email);
    sendSuccess(res, result);
  });
}

module.exports = new AuthController();
