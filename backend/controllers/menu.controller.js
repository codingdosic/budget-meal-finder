// backend/controllers/menu.controller.js

const MenuService = require('../services/menu.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

class MenuController {
  constructor() {
    this.upload = upload.single('image');
  }

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
    const updatedMenu = await MenuService.updateMenu(id, req.body, req.file);
    sendSuccess(res, updatedMenu);
  });

  deleteMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await MenuService.deleteMenu(id, req.user.userId);
    sendSuccess(res, { message: 'Menu deleted successfully' });
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
}

module.exports = new MenuController();
