// backend/utils/asyncHandler.js

const asyncHandler = (fn) => (req, res, next) => {
  Promise
    .resolve(fn(req, res, next)) // fn 실행하고 동기/비동기 관계없이 Promise를 반환
    .catch(next); // fn에서 에러 발생 시 next()로 에러 전달
};

module.exports = asyncHandler;
