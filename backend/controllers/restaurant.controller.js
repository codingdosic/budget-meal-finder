// backend/controllers/restaurant.controller.js

const RestaurantService = require('../services/restaurant.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');

class RestaurantController {
  createRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await RestaurantService.createRestaurant(req.body, req.user.userId);
    sendSuccess(res, restaurant, 201);
  });

  getAllRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await RestaurantService.getAllRestaurants();
    sendSuccess(res, restaurants);
  });

  getRestaurantById = asyncHandler(async (req, res) => {
    const restaurant = await RestaurantService.getRestaurantById(req.params.id);
    sendSuccess(res, restaurant);
  });

  deleteRestaurant = asyncHandler(async (req, res) => {
    const result = await RestaurantService.deleteRestaurant(req.params.id, req.user.userId);
    sendSuccess(res, result);
  });
}

module.exports = new RestaurantController();
