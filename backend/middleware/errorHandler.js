// backend/middleware/errorHandler.js

const ApiError = require('../errors/ApiError');

const errorHandler = (err, req, res, next) => {
  console.error(err); // 개발 중 에러 로깅

  let statusCode = 500;
  let message = 'Something went wrong';
  let details = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  }

  const errorResponse = {
    message,
    ...(details && { details }), // Add details field only if it exists
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Add stack only in dev
  };

  res.status(statusCode).json({
    success: false,
    error: errorResponse,
  });
};

module.exports = errorHandler;