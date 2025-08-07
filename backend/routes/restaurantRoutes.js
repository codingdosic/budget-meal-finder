// backend/routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/restaurant.controller');
const authMiddleware = require('../middleware/authMiddleware');

// [POST] 새로운 식당 정보 등록
router.post('/', authMiddleware, RestaurantController.createRestaurant);

// [GET] 전체 식당 목록 조회
router.get('/', RestaurantController.getAllRestaurants);

// [GET] 특정 ID의 식당 정보 조회
router.get('/:id', RestaurantController.getRestaurantById);

// [DELETE] 특정 ID의 식당 정보 삭제
router.delete('/:id', authMiddleware, RestaurantController.deleteRestaurant);

module.exports = router;

