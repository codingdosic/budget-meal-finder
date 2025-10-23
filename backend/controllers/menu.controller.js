// backend/controllers/menu.controller.js

const MenuService = require('../services/menu.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');

class MenuController {
  createMenuForRestaurant = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const menu = await MenuService.createMenuForRestaurant(restaurantId, req.body, req.user.userId, imageUrl);
    sendSuccess(res, menu, 201);
  });

  createMenuWithNewRestaurant = asyncHandler(async (req, res) => {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const menu = await MenuService.createMenuWithNewRestaurant(req.body, req.user.userId, imageUrl);
    sendSuccess(res, menu, 201);
  });

  getAllMenus = asyncHandler(async (req, res) => {
    const menus = await MenuService.getAllMenus();
    sendSuccess(res, menus);
  });

  getMenusByRestaurant = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const menus = await MenuService.getMenusByRestaurant(restaurantId);
    sendSuccess(res, menus);
  });

  updateMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updatedMenu = await MenuService.updateMenu(id, req.body, req.file, req.user.userId);
    sendSuccess(res, updatedMenu);
  });

  deleteMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await MenuService.deleteMenu(id, req.user.userId);
    res.status(204).send();
  });

  recommendMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await MenuService.recommendOrDisrecommend(id, req.user.userId, 'recommend');
    sendSuccess(res, result);
  });

  disrecommendMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await MenuService.recommendOrDisrecommend(id, req.user.userId, 'disrecommend');
    sendSuccess(res, result);
  });

  advancedSearch = asyncHandler(async (req, res) => {
    const menus = await MenuService.advancedSearch(req.query);
    sendSuccess(res, menus);
  });

  getMenusByCurrentUser = asyncHandler(async (req, res) => {
    const menus = await MenuService.getMenusByUsername(req.user.username);
    sendSuccess(res, menus);
  });
}

module.exports = new MenuController();
