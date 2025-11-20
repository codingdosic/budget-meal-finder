const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/user:
 *   get:
 *     tags: [User]
 *     summary: Get current user information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, UserController.getCurrentUser);

/**
 * @swagger
 * /api/user/password:
 *   put:
 *     tags: [User]
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized or invalid current password
 *       500:
 *         description: Server error
 */
router.put('/password', authMiddleware, UserController.changePassword);

/**
 * @swagger
 * /api/user/email:
 *   put:
 *     tags: [User]
 *     summary: Change user email
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *               - password
 *             properties:
 *               newEmail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email change request successful
 *       401:
 *         description: Unauthorized or invalid password
 *       500:
 *         description: Server error
 */
router.put('/email', authMiddleware, UserController.changeEmail);

/**
 * @swagger
 * /api/user:
 *   delete:
 *     tags: [User]
 *     summary: Delete user account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized or invalid password
 *       500:
 *         description: Server error
 */
router.delete('/', authMiddleware, UserController.deleteAccount);

module.exports = router;
