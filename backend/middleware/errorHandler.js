// backend/middleware/errorHandler.js

const ApiError = require('../errors/ApiError');

const errorHandler = (err, req, res, next) => {
  console.error(err); // 개발 중 에러 로깅

  let statusCode = 500;
  let message = 'Something went wrong';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      // 개발 환경에서만 스택 트레이스 포함 (선택적)
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};

module.exports = errorHandler;