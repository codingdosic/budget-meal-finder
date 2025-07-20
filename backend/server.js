require('dotenv').config(); // 💡 최상단에 위치해야 함

const express = require('express');
const connectDB = require('./db/db');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const app = express();
connectDB();

app.use(express.json());

// 회원가입
app.post('/api/register', async (req, res) => {
  try {

    // 요청 본문에서 사용자 이름, 이메일, 비밀번호 추출
    const { username, email, password } = req.body;

    // 새로운 User 인스턴스 생성
    const user = new User({ username, email, password });

    // 사용자 정보를 데이터베이스에 저장 (비밀번호는 pre-save 훅에서 해싱됨)
    await user.save();

    // 성공 응답 전송 (상태 코드 201: Created)
    res.status(201).send('User created');
  } catch (error) {

    // 에러 발생 시, 상태 코드 400과 에러 메시지 전송
    res.status(400).send(error.message);
  }
});

// 로그인 API 엔드포인트 정의
app.post('/api/login', async (req, res) => {
  try {

    // 요청 본문에서 이메일과 비밀번호 추출
    const { email, password } = req.body;

    // 이메일을 사용하여 데이터베이스에서 사용자 찾기
    const user = await User.findOne({ email });

    // 사용자가 존재하지 않으면 에러 응답 전송
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 사용자가 입력한 비밀번호와 저장된 해시된 비밀번호 비교
    const isMatch = await user.comparePassword(password);

    // 비밀번호가 일치하지 않으면 에러 응답 전송
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // JWT(JSON Web Token) 생성 (사용자 ID와 환경 변수에 저장된 비밀 키 사용, 1시간 유효)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // 생성된 토큰을 JSON 형태로 응답 전송
    res.json({ token });
  } catch (error) {
    // 서버 에러 발생 시, 상태 코드 500과 에러 메시지 전송
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
