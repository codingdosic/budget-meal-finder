// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');

// 현재 로그인된 사용자 정보 가져오기
router.get('/', authMiddleware, UserController.getCurrentUser);

// 비밀번호 변경
router.put('/password', authMiddleware, UserController.changePassword);

// 이메일 변경
router.put('/email', authMiddleware, UserController.changeEmail);

// 계정 삭제
router.delete('/', authMiddleware, UserController.deleteAccount);

module.exports = router;
