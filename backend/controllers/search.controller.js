// backend/controllers/search.controller.js

const SearchService = require('../services/search.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');

class SearchController {
  searchNearby = asyncHandler(async (req, res) => {
    const { lat, lon, budget, distance = 2000 } = req.query;
    const results = await SearchService.searchNearby(lat, lon, budget, distance);
    sendSuccess(res, results);
  });
}

module.exports = new SearchController();
