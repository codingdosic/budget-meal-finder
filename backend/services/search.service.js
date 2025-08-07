// backend/services/search.service.js

const RestaurantRepository = require('../repositories/restaurant.repository');
const ApiError = require('../errors/ApiError');

class SearchService {
  async searchNearby(lat, lon, budget, distance) {
    if (!lat || !lon || !budget) {
      throw new ApiError(400, 'Latitude, longitude, and budget are required.');
    }

    const pipeline = [
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
          lat: { $arrayElemAt: ['$location.coordinates', 1] },
          lon: { $arrayElemAt: ['$location.coordinates', 0] }
        },
      },
    ];

    return await RestaurantRepository.aggregate(pipeline);
  }
}

module.exports = new SearchService();