// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');

// 현재 로그인된 사용자 정보 가져오기
router.get('/', authMiddleware, UserController.getCurrentUser);

module.exports = router;
