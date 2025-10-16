const request = require('supertest');
const express = require('express');
const searchRoutes = require('../backend/routes/searchRoutes');
const errorHandler = require('../backend/middleware/errorHandler');
const searchService = require('../backend/services/search.service');

// Mock the search service
jest.mock('../backend/services/search.service', () => ({
  searchMenus: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/search', searchRoutes);
app.use(errorHandler);

describe('Search API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/search', () => {
    it('should return menus based on price', async () => {
      const price = 10000;
      const menus = [{ name: 'Menu 1', price: 8000 }, { name: 'Menu 2', price: 9000 }];
      searchService.searchMenus.mockResolvedValue(menus);

      const res = await request(app).get(`/api/search?price=${price}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(menus);
      expect(searchService.searchMenus).toHaveBeenCalledWith({ price: price.toString(), category: undefined, keyword: undefined });
    });

    it('should return menus based on category', async () => {
      const category = 'korean';
      const menus = [{ name: 'Menu 1', category: 'korean' }, { name: 'Menu 2', category: 'korean' }];
      searchService.searchMenus.mockResolvedValue(menus);

      const res = await request(app).get(`/api/search?category=${category}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(menus);
      expect(searchService.searchMenus).toHaveBeenCalledWith({ price: undefined, category: category, keyword: undefined });
    });

    it('should return menus based on keyword', async () => {
      const keyword = 'test';
      const menus = [{ name: 'Test Menu 1' }, { name: 'Another Test' }];
      searchService.searchMenus.mockResolvedValue(menus);

      const res = await request(app).get(`/api/search?keyword=${keyword}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(menus);
      expect(searchService.searchMenus).toHaveBeenCalledWith({ price: undefined, category: undefined, keyword: keyword });
    });

    it('should return menus based on combined conditions', async () => {
      const price = 12000;
      const category = 'chinese';
      const keyword = 'spicy';
      const menus = [{ name: 'Spicy Chinese Noodle', price: 11000, category: 'chinese' }];
      searchService.searchMenus.mockResolvedValue(menus);

      const res = await request(app).get(`/api/search?price=${price}&category=${category}&keyword=${keyword}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(menus);
      expect(searchService.searchMenus).toHaveBeenCalledWith({ price: price.toString(), category: category, keyword: keyword });
    });
  });
});
