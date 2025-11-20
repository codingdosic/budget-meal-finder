// backend/controllers/misc.controller.js

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');

class MiscController {
  getMapsKey = asyncHandler(async (req, res) => {
    
    // 환경 변수에서 Google Maps API 키 객체 반환
    sendSuccess(res, { apiKey: process.env.GOOGLE_MAPS_API_KEY });
  });
}

module.exports = new MiscController();
