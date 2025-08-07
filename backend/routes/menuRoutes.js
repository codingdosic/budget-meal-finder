// backend/routes/menuRoutes.js

const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menu.controller');
const authMiddleware = require('../middleware/authMiddleware');

// [GET] 고급 검색
router.get('/advanced-search', MenuController.advancedSearch);

// [GET] 모든 메뉴 조회
router.get('/all-menus', MenuController.getAllMenus);

// [POST] 특정 식당에 메뉴 추가
router.post('/:restaurantId/menus', authMiddleware, MenuController.upload, MenuController.createMenuForRestaurant);

// [POST] 지도에서 마커 추가 시 메뉴 생성
router.post('/', authMiddleware, MenuController.upload, MenuController.createMenuWithNewRestaurant);

// [GET] 특정 식당의 메뉴 목록 조회
router.get('/:restaurantId/menus', MenuController.getMenusByRestaurant);

// [PUT] 특정 메뉴 정보 수정
router.put('/:id', authMiddleware, MenuController.upload, MenuController.updateMenu);

// [DELETE] 특정 메뉴 삭제
router.delete('/:id', authMiddleware, MenuController.deleteMenu);

// [POST] 메뉴 추천
router.post('/:id/recommend', authMiddleware, MenuController.recommendMenu);

// [POST] 메뉴 비추천
router.post('/:id/disrecommend', authMiddleware, MenuController.disrecommendMenu);

module.exports = router;
""
