const { body, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../errors/ApiError');

// 에러 검증 미들웨어
const handleValidationErrors = asyncHandler(async (req, res, next) => {

  // 검증 결과 추출
  const errors = validationResult(req);

  // 에러가 있으면 에러 던지기
  if (!errors.isEmpty()) {

    // 에러 배열로 포맷팅
    const formattedErrors = errors.array().map(err => ({ field: err.path, message: err.msg }));

    // 에러 던지기
    throw new ApiError(400, 'Validation failed', formattedErrors);
  }

  // 에러 없으면 다음 미들웨어로 이동
  next();
});

// 회원가입 검증 미들웨어 배열
const registerValidator = [

  // 사용자명 검증 미들웨어
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required.'),

  // 이메일 검증 미들웨어
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  
  // 비밀번호 검증 미들웨어
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),

  // 에러 핸들링 미들웨어
  handleValidationErrors
];

// 로그인 검증 미들웨어 배열
const loginValidator = [

  // 이메일 검증 미들웨어
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  // 비밀번호 검증 미들웨어
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),

  // 에러 핸들링 미들웨어
  handleValidationErrors
];

module.exports = {
  registerValidator,
  loginValidator
};