// backend/routes/searchRoutes.js

const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/search.controller');

router.get('/search', SearchController.searchNearby);

module.exports = router;
