
const ApiError = require('../errors/ApiError');

// 관리자 권한 확인 미들웨어
const adminMiddleware = (req, res, next) => {
  // 인증 미들웨어를 통해 req.user에 저장된 사용자 정보를 확인
  if (req.user && req.user.role === 'admin') {
    // 사용자가 관리자일 경우 다음 미들웨어로 진행
    next();
  } else {
    // 관리자가 아닐 경우 403 Forbidden 에러 발생
    next(ApiError.forbidden('접근 권한이 없습니다. 관리자만 접근 가능합니다.'));
  }
};

module.exports = adminMiddleware;
