// db 모듈 
const mongoose = require('mongoose');
// env 파일 
const dotenv = require("dotenv");

// 설정 불러오기
dotenv.config();

// db 연결 비동기 함수 
const connectDB = async () => {
  try {
    // MongoDB URI 환경 변수에서 가져오기
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
  } catch (err) {
    console.error('❌ DB Connection Error:', err.message);
    
    process.exit(1);
  }
};

module.exports = connectDB;