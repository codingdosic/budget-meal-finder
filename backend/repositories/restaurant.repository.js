// backend/repositories/restaurant.repository.js

const Restaurant = require('../../models/Restaurant');

class RestaurantRepository {
  async createRestaurant(restaurantData) {
    const restaurant = new Restaurant(restaurantData);
    return await restaurant.save();
  }

  async findAllRestaurants() {
    return await Restaurant.find();
  }

  async findRestaurantById(restaurantId) {
    return await Restaurant.findById(restaurantId);
  }

  async deleteRestaurant(restaurantId) {
    return await Restaurant.findByIdAndDelete(restaurantId);
  }
  async aggregate(pipeline) {
    return await Restaurant.aggregate(pipeline);
  }
}

module.exports = new RestaurantRepository();
