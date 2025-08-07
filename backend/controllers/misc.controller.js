// backend/controllers/misc.controller.js

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');

class MiscController {
  getMapsKey = asyncHandler(async (req, res) => {
    sendSuccess(res, { apiKey: process.env.GOOGLE_MAPS_API_KEY });
  });
}

module.exports = new MiscController();
