require('dotenv').config();

const express = require('express');
const path = require('path');
const connectDB = require('./db/db');

// 라우트 모듈 불러오기
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');
const miscRoutes = require('./routes/miscRoutes');

const app = express();

// 데이터베이스 연결
connectDB();

// 미들웨어 설정
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.static(path.join(__dirname, '../frontend'))); // 정적 파일 제공

// 루트 경로 핸들러 (index.html 제공)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/index.html'));
});

// 라우트 연결
app.use('/api', authRoutes); // /api/register, /api/login
app.use('/api/restaurants', restaurantRoutes); // /api/restaurants
app.use('/api/menus', menuRoutes); // /api/menus, /api/all-menus, /api/menus/:id
app.use('/api', miscRoutes); // /api/search, /api/maps-key

const authMiddleware = require('./middleware/authMiddleware');
app.get('/api/user', authMiddleware, (req, res) => {
    res.status(200).json({
        userId: req.user.userId,
        username: req.user.username
    });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});