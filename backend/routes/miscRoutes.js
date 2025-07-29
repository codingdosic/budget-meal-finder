// backend/routes/miscRoutes.js
const express = require('express');
const router = express.Router();
const Restaurant = require('../../models/Restaurant');

// 🚀 [GET] 위치와 예산 기반 메뉴 검색
router.get('/search', async (req, res) => {
  try {
    const { lat, lon, budget, distance = 2000 } = req.query;

    if (!lat || !lon || !budget) {
      return res.status(400).json({ message: 'Latitude, longitude, and budget are required.' });
    }

    const results = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)],
          },
          distanceField: 'dist.calculated',
          maxDistance: parseInt(distance),
          spherical: true,
        },
      },
      {
        $lookup: {
          from: 'menus',
          localField: '_id',
          foreignField: 'restaurantId',
          as: 'menus',
        },
      },
      {
        $unwind: '$menus',
      },
      {
        $match: {
          'menus.price': { $lte: parseInt(budget) },
        },
      },
      {
        $project: {
          _id: 0,
          restaurantName: '$name',
          restaurantAddress: '$address',
          distance: '$dist.calculated',
          menuName: '$menus.name',
          menuPrice: '$menus.price',
        },
      },
    ]);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Google Maps API 키를 클라이언트에 제공하는 엔드포인트
router.get('/maps-key', (req, res) => {
  res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

module.exports = router;
