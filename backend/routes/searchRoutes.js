const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/search.controller');

/**
 * @swagger
 * /api/search:
 *   get:
 *     tags: [Search]
 *     summary: Search for menus
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of menus matching the search query
 *       500:
 *         description: Server error
 */
router.get('/', SearchController.searchMenus);

/**
 * @swagger
 * /api/search/nearby:
 *   get:
 *     tags: [Search]
 *     summary: Search for nearby menus
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 1000
 *     responses:
 *       200:
 *         description: A list of nearby menus
 *       500:
 *         description: Server error
 */
router.get('/nearby', SearchController.searchNearby);

module.exports = router;
