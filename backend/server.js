// 환경변수 설정 (dotenv)
// .env 파일의 환경변수를 process.env로 불러오기 위해 사용
require('dotenv').config();

const express = require('express');
const path = require('path');

// DB 연결 함수 모듈
const connectDB = require('./db/db');

// 라우트 모듈 불러오기
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');
const miscRoutes = require('./routes/miscRoutes');
const searchRoutes = require('./routes/searchRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 데이터베이스 연결 실행
connectDB();

// JSON 요청 본문을 파싱하는 미들웨어 등록
app.use(express.json());

// 'uploads' 폴더의 파일을 정적 자산으로 제공
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 정적 파일 제공 미들웨어 (frontend 폴더의 파일들 제공)
app.use(express.static(path.join(__dirname, '../frontend')));

// 루트 경로 요청 시 index.html 파일 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/views/index.html'));
});

// 라우트 연결
// 인증 관련: /api/register, /api/login 등
app.use('/api/auth', authRoutes);

// 식당 관련: /api/restaurants 경로에 라우트 연결
app.use('/api/restaurants', restaurantRoutes);

// 메뉴 관련: /api/menus 등
app.use('/api/menus', menuRoutes);

// 기타 기능 라우트: /api/search, /api/maps-key 등
app.use('/api', miscRoutes);
app.use('/api', searchRoutes);
app.use('/api/user', userRoutes);

const errorHandler = require('./middleware/errorHandler');

// 중앙 에러 처리 미들웨어
app.use(errorHandler);

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
