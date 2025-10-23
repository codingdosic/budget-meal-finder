// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../middleware/validators');

// 회원가입 API - 가입 유효성 검사 미들웨어 포함
router.post('/register', registerValidator, AuthController.register);

// 관리자 회원가입 API
router.post('/register-admin', registerValidator, AuthController.registerAdmin);

// 로그인 API - 로그인 유효성 검사 미들웨어 포함
router.post('/login', loginValidator, AuthController.login);

// 비밀번호 재설정 (임시 비밀번호 발급)
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
