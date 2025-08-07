// backend/services/restaurant.service.js

const RestaurantRepository = require('../repositories/restaurant.repository');
const ApiError = require('../errors/ApiError');

class RestaurantService {
  async createRestaurant(restaurantData, userId) {
    return await RestaurantRepository.createRestaurant({ ...restaurantData, createdBy: userId });
  }

  async getAllRestaurants() {
    return await RestaurantRepository.findAllRestaurants();
  }

  async getRestaurantById(restaurantId) {
    const restaurant = await RestaurantRepository.findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }
    return restaurant;
  }

  async deleteRestaurant(restaurantId, userId) {
    const restaurant = await this.getRestaurantById(restaurantId);

    if (restaurant.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Unauthorized');
    }

    await RestaurantRepository.deleteRestaurant(restaurantId);
    
    return { message: 'Restaurant deleted' };
  }
}

module.exports = new RestaurantService();