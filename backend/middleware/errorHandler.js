// backend/middleware/errorHandler.js

const ApiError = require('../errors/ApiError');

// 에러 처리 미들웨어
const errorHandler = (err, req, res, next) => {

  // 에러 확인용 로그
  console.error(err); 

  // 기본 에러 응답 
  let statusCode = 500;
  let message = 'Something went wrong';
  let details = null;

  // ApiError 인스턴스인 경우 상태 코드와 메시지 설정
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  }

  // 에러 응답 객체
  const errorResponse = {
    message, // 에러 메시지
    ...(details && { details }), // 추가 정보 (조건이 true일 때만 그 키를 객체에 추가)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // 개발 환경에서만 스택 트레이스 포함
  };

  // 에러 응답 전송
  res.status(statusCode).json({
    success: false,
    error: errorResponse,
  });
};

module.exports = errorHandler;