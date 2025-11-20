const MenuRepository = require('../repositories/menu.repository');
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
          distanceField: 'distance', // Output distance field
          maxDistance: parseInt(distance),
          query: { price: { $lte: parseInt(budget) } }, // Filter by budget
          spherical: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          description: 1,
          username: 1,
          category: 1,
          imageUrl: 1,
          recommendations: 1,
          disrecommendations: 1,
          createdAt: 1,
          distance: 1,
          lat: { $arrayElemAt: ['$location.coordinates', 1] },
          lon: { $arrayElemAt: ['$location.coordinates', 0] },
        },
      },
    ];

    // We need to add an aggregate method to MenuRepository
    return await MenuRepository.aggregate(pipeline);
  }

  async searchMenus({ price, category, keyword }) {
    const query = {};

    if (price) {
      query.price = { $lte: parseInt(price) };
    }
    if (category) {
      query.category = category;
    }
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    return await MenuRepository.searchMenus(query);
  }
}

module.exports = new SearchService();