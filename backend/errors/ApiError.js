// backend/errors/ApiError.js

// 기본 에러 상속 클래스
class ApiError extends Error {

  // 생성자, 메시지에 더불어 상태 코드와 상세 정보 추가
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details; 
    this.name = this.constructor.name; // 인스턴스명 ApiError으로 설정
    Error.captureStackTrace(this, this.constructor); // 현재 클래스에서 스택 트레이스 캡처
  }
}

module.exports = ApiError;
