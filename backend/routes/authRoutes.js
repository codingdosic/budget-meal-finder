// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// 회원가입 API
router.post('/register', AuthController.register);

// 로그인 API
router.post('/login', AuthController.login);

module.exports = router;
