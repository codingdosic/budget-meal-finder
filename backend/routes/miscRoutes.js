// backend/routes/miscRoutes.js

const express = require('express');
const router = express.Router();
const MiscController = require('../controllers/misc.controller');

// Google Maps API 키 제공 API
router.get('/maps-key', MiscController.getMapsKey);

module.exports = router;
