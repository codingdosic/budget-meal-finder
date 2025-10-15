// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// 회원가입 API
router.post('/register', AuthController.register);

// 로그인 API
router.post('/login', AuthController.login);

// 비밀번호 재설정 (임시 비밀번호 발급)
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
