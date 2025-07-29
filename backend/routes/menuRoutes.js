// backend/routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const Menu = require('../../models/Menu');
const Restaurant = require('../../models/Restaurant');
const User = require('../../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// 🚀 [POST] 특정 식당에 메뉴 추가 (인증 필요)
router.post('/:restaurantId/menus', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, price, description } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const menu = new Menu({
      restaurantId,
      name,
      price,
      description,
      username: user.username,
    });
    await menu.save();

    user.menus.push(menu._id);
    await user.save();

    res.status(201).json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 🚀 [POST] 지도에서 마커 추가 시 메뉴 생성 (인증 필요)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, price, description, lat, lon } = req.body;

    if (!name || !price || !lat || !lon) {
      return res.status(400).json({ message: 'Menu name, price, latitude, and longitude are required.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const restaurant = new Restaurant({
      name: `User Added Restaurant - ${name}`,
      address: `Lat: ${lat}, Lon: ${lon}`,
      location: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
      category: 'User Added',
      createdBy: req.user.userId,
    });
    await restaurant.save();

    const menu = new Menu({
      restaurantId: restaurant._id,
      name,
      price,
      description,
      username: user.username,
    });
    await menu.save();

    user.menus.push(menu._id);
    await user.save();

    res.status(201).json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 🚀 [GET] 모든 메뉴 조회 (지도에 표시용)
router.get('/all-menus', async (req, res) => {
  try {
    const menus = await Menu.find().populate('restaurantId');
    const formattedMenus = menus.map(menu => ({
      _id: menu._id,
      name: menu.name,
      price: menu.price,
      description: menu.description,
      username: menu.username,
      restaurantName: menu.restaurantId ? menu.restaurantId.name : 'Unknown Restaurant',
      lat: menu.restaurantId && menu.restaurantId.location ? menu.restaurantId.location.coordinates[1] : null,
      lon: menu.restaurantId && menu.restaurantId.location ? menu.restaurantId.location.coordinates[0] : null,
    }));
    res.json(formattedMenus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🚀 [GET] 특정 식당의 메뉴 목록 조회
router.get('/:restaurantId/menus', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const menus = await Menu.find({ restaurantId });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🚀 [PUT] 특정 메뉴 정보 수정 (인증 필요)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;
    const updatedMenu = await Menu.findByIdAndUpdate(id, { name, price, description }, { new: true });
    if (!updatedMenu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.json(updatedMenu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 🚀 [DELETE] 특정 메뉴 삭제 (인증 필요)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // 메뉴를 생성한 사용자인지 확인
    const user = await User.findOne({ username: menu.username });
    if (!user || user._id.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    // 사용자의 menus 배열에서 메뉴 ID 제거
    user.menus.pull(id);
    await user.save();

    // 메뉴 삭제
    await Menu.findByIdAndDelete(id);

    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
