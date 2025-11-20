// backend/routes/miscRoutes.js

const express = require('express');
const router = express.Router();
const MiscController = require('../controllers/misc.controller');

/**
 * @swagger
 * /api/maps-key:
 *   get:
 *     tags: [Misc]
 *     summary: Get Google Maps API Key
 *     responses:
 *       200:
 *         description: API Key for Google Maps
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKey:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get('/maps-key', MiscController.getMapsKey);

module.exports = router;
