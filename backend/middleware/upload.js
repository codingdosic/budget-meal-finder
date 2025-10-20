// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');

// 파일 업로드 설정
const storage = multer.diskStorage({
  // 파일 저장 위치
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  // 파일 이름
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// multer 인스턴스 생성
const upload = multer({ storage });

module.exports = upload;
