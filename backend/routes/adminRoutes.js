// backend/routes/adminRoutes.js
console.log('adminRoutes.js loaded and defining routes');

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// 모든 라우트에 인증 및 관리자 권한 미들웨어 적용
router.use(authMiddleware, adminMiddleware);

router.get('/test', (req, res) => {
  res.status(200).send('Admin test route hit!');
});

// 모든 사용자 목록 가져오기 (검색 기능 포함)
router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);

// 특정 사용자의 모든 메뉴 가져오기
router.get('/users/:userId/menus', adminController.getUserMenus);

module.exports = router;
