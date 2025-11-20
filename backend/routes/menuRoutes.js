const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menu.controller');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/menus/advanced-search:
 *   get:
 *     tags: [Menu]
 *     summary: Advanced search for menus
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of menus
 *       500:
 *         description: Server error
 */
router.get('/advanced-search', MenuController.advancedSearch);

/**
 * @swagger
 * /api/menus/all-menus:
 *   get:
 *     tags: [Menu]
 *     summary: Get all menus
 *     responses:
 *       200:
 *         description: A list of all menus
 *       500:
 *         description: Server error
 */
router.get('/all-menus', MenuController.getAllMenus);

/**
 * @swagger
 * /api/menus/my-menus:
 *   get:
 *     tags: [Menu]
 *     summary: Get menus created by the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of my menus
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/my-menus', authMiddleware, MenuController.getMenusByCurrentUser);

/**
 * @swagger
 * /api/menus:
 *   post:
 *     tags: [Menu]
 *     summary: Create a new menu
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               restaurant:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: integer
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       201:
 *         description: Menu created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, upload.single('image'), MenuController.createMenu);

/**
 * @swagger
 * /api/menus/{id}:
 *   put:
 *     tags: [Menu]
 *     summary: Update a specific menu
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               restaurant:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: integer
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authMiddleware, upload.single('image'), MenuController.updateMenu);

/**
 * @swagger
 * /api/menus/{id}:
 *   delete:
 *     tags: [Menu]
 *     summary: Delete a specific menu
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, MenuController.deleteMenu);

/**
 * @swagger
 * /api/menus/{id}/recommend:
 *   post:
 *     tags: [Menu]
 *     summary: Recommend a menu
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu recommended successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Server error
 */
router.post('/:id/recommend', authMiddleware, MenuController.recommendMenu);

/**
 * @swagger
 * /api/menus/{id}/disrecommend:
 *   post:
 *     tags: [Menu]
 *     summary: Disrecommend a menu
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu disrecommended successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Server error
 */
router.post('/:id/disrecommend', authMiddleware, MenuController.disrecommendMenu);

module.exports = router;
