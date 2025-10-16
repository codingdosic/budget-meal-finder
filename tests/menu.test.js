const request = require('supertest');
const express = require('express');
const menuRoutes = require('../backend/routes/menuRoutes');
const errorHandler = require('../backend/middleware/errorHandler');
const authMiddleware = require('../backend/middleware/authMiddleware');
const menuService = require('../backend/services/menu.service');

// Mock services and middleware
jest.mock('../backend/services/menu.service', () => ({
  createMenuForRestaurant: jest.fn(),
  getAllMenus: jest.fn(),
  getMenu: jest.fn(),
  updateMenu: jest.fn(),
  deleteMenu: jest.fn(),
}));
jest.mock('../backend/middleware/authMiddleware', () => jest.fn((req, res, next) => {
  req.user = { userId: 'testUserId', username: 'testuser' };
  next();
}));

const app = express();
app.use(express.json());
app.use('/api/menus', menuRoutes);
app.use(errorHandler);

describe('Menu API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/menus/:restaurantId/menus', () => {
    it('should create a new menu and return 201', async () => {
      const menuData = { name: 'Test Menu', price: 10000, description: 'A delicious test menu' };
      const createdMenu = { _id: 'someMenuId', ...menuData };
      const restaurantId = 'someRestaurantId';

      menuService.createMenuForRestaurant.mockResolvedValue(createdMenu);

      const res = await request(app)
        .post(`/api/menus/${restaurantId}/menus`)
        .send(menuData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toEqual(expect.objectContaining(menuData));
      expect(menuService.createMenuForRestaurant).toHaveBeenCalled();
    });
  });

  describe('GET /api/menus/all-menus', () => {
    it('should return all menus and status 200', async () => {
      const menus = [{ name: 'Menu 1' }, { name: 'Menu 2' }];
      menuService.getAllMenus.mockResolvedValue(menus);

      const res = await request(app).get('/api/menus/all-menus');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(menus);
      expect(menuService.getAllMenus).toHaveBeenCalled();
    });
  });

  describe('PUT /api/menus/:id', () => {
    it('should update a menu and return 200', async () => {
      const menuId = 'someMenuId';
      const updateData = { name: 'Updated Menu Name' };
      const updatedMenu = { _id: menuId, ...updateData };

      menuService.updateMenu.mockResolvedValue(updatedMenu);

      const res = await request(app)
        .put(`/api/menus/${menuId}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(expect.objectContaining(updateData));
      expect(menuService.updateMenu).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/menus/:id', () => {
    it('should delete a menu and return 204', async () => {
      const menuId = 'someMenuId';

      menuService.deleteMenu.mockResolvedValue(true);

      const res = await request(app).delete(`/api/menus/${menuId}`);

      expect(res.statusCode).toEqual(204);
      expect(menuService.deleteMenu).toHaveBeenCalledWith(menuId, 'testUserId');
    });
  });
});
