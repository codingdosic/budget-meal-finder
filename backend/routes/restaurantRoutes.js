// backend/routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const Restaurant = require('../../models/Restaurant');
const authMiddleware = require('../middleware/authMiddleware');

// 🚀 [POST] 새로운 식당 정보 등록 (인증 필요)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, address, location, category } = req.body;
    const restaurant = new Restaurant({
      name,
      address,
      location,
      category,
      createdBy: req.user.userId,
    });
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 🚀 [GET] 전체 식당 목록 조회
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🚀 [GET] 특정 ID의 식당 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🚀 [DELETE] 특정 ID의 식당 정보 삭제 (인증 필요)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // 본인이 등록한 식당만 삭제 가능
    if (restaurant.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await restaurant.remove();
    res.json({ message: 'Restaurant deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

