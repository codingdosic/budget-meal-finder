// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../middleware/validators');

// 회원가입 API - 가입 유효성 검사 미들웨어 포함
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - userType
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [customer, owner]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       500:
 *         description: Server error
 */
router.post('/register', registerValidator, AuthController.register);

// 관리자 회원가입 API
router.post('/register-admin', registerValidator, AuthController.registerAdmin);

// 로그인 API - 로그인 유효성 검사 미들웨어 포함
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', loginValidator, AuthController.login);

// 비밀번호 재설정 (임시 비밀번호 발급)
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
