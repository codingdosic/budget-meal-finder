// backend/middleware/authMiddleware.js


// 인증 미들웨어
// - 클라이언트가 보낸 JWT 토큰을 확인하여 인증 여부를 판단
// - 유효한 토큰이 있으면 req.user 에 디코딩된 사용자 정보를 추가하고 다음 미들웨어로 진행
// - 토큰이 없거나 유효하지 않으면 401 또는 400 에러 응답


// jwt 모듈 불러오기
const jwt = require('jsonwebtoken');

// 인증 미들웨어 함수 정의
const authMiddleware = async (req, res, next) => {

  // 요청 헤더에서 Authorization 값을 가져옴
  const authHeader = req.header('Authorization');

  // Authorization 헤더가 없으면 접근 거부 (401 Unauthorized)
  if (!authHeader) {
    return res.status(401).send('Access denied. No token provided.');
  }

  // "Bearer " 접두사를 제거하고 실제 토큰 값만 추출
  const token = authHeader.replace('Bearer ', '');

  try {

    // JWT 검증 (서명 확인 및 만료 여부 확인)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 정보를 요청 객체에 추가
    req.user = decoded;

    // 다음 미들웨어 또는 라우터로 이동
    next();

  } catch (error) {
    // 토큰이 유효하지 않으면 클라이언트에 오류 반환 (400 Bad Request)
    res.status(400).send('Invalid token.');
  }
};

// 미들웨어를 외부에서 사용할 수 있도록 모듈로 내보냄
module.exports = authMiddleware;
