// backend/services/menu.service.js

const MenuRepository = require('../repositories/menu.repository');
const RestaurantRepository = require('../repositories/restaurant.repository');
const UserRepository = require('../repositories/user.repository');
const User = require('../../models/User');
const ApiError = require('../errors/ApiError');

class MenuService {
  async createMenuForRestaurant(restaurantId, menuData, userId, imageUrl) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const newMenu = await MenuRepository.createMenu({
      ...menuData,
      restaurantId,
      username: user.username,
      imageUrl,
    });

    user.menus.push(newMenu._id);
    await user.save();

    return newMenu;
  }

  async createMenuWithNewRestaurant(menuData, userId, imageUrl) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const restaurant = await RestaurantRepository.createRestaurant({
      name: `User Added Restaurant - ${menuData.name}`,
      address: `Lat: ${menuData.lat}, Lon: ${menuData.lon}`,
      location: { type: 'Point', coordinates: [parseFloat(menuData.lon), parseFloat(menuData.lat)] },
      category: 'User Added',
      createdBy: userId,
    });

    const newMenu = await MenuRepository.createMenu({
      restaurantId: restaurant._id,
      name: menuData.name,
      price: menuData.price,
      description: menuData.description,
      username: user.username,
      category: menuData.category,
      imageUrl,
    });

    user.menus.push(newMenu._id);
    await user.save();

    return newMenu;
  }

  async getAllMenus() {
    const menus = await MenuRepository.findAllMenus();
    return menus.map(this.formatMenu);
  }

  async getMenusByRestaurant(restaurantId) {
    return await MenuRepository.findMenusByRestaurantId(restaurantId);
  }

  async updateMenu(menuId, updateData, file) {
    if (file) {
      updateData.imageUrl = `/uploads/${file.filename}`;
    }
    const updatedMenu = await MenuRepository.updateMenu(menuId, updateData);
    if (!updatedMenu) throw new ApiError(404, 'Menu not found');
    return updatedMenu;
  }

  async deleteMenu(menuId, userId) {
    const menu = await MenuRepository.findMenuById(menuId);
    if (!menu) throw new ApiError(404, 'Menu not found');

    const user = await User.findOne({ username: menu.username });
    if (!user || user._id.toString() !== userId) {
      throw new ApiError(403, 'Unauthorized');
    }

    user.menus.pull(menuId);
    await user.save();

    return await MenuRepository.deleteMenu(menuId);
  }

  async recommendOrDisrecommend(menuId, userId, action) {
    const menu = await MenuRepository.findMenuById(menuId);
    const user = await User.findById(userId);
    if (!menu || !user) throw new ApiError(404, 'Menu or User not found');

    const isRecommended = user.recommendedMenus.includes(menuId);
    const isDisrecommended = user.disrecommendedMenus.includes(menuId);

    if (action === 'recommend') {
      if (isDisrecommended) {
        user.disrecommendedMenus.pull(menuId);
        menu.disrecommendations -= 1;
      }
      if (isRecommended) {
        user.recommendedMenus.pull(menuId);
        menu.recommendations -= 1;
      } else {
        user.recommendedMenus.push(menuId);
        menu.recommendations += 1;
      }
    } else { // disrecommend
      if (isRecommended) {
        user.recommendedMenus.pull(menuId);
        menu.recommendations -= 1;
      }
      if (isDisrecommended) {
        user.disrecommendedMenus.pull(menuId);
        menu.disrecommendations -= 1;
      } else {
        user.disrecommendedMenus.push(menuId);
        menu.disrecommendations += 1;
      }
    }

    await menu.save();
    await user.save();

    return { recommendations: menu.recommendations, disrecommendations: menu.disrecommendations };
  }

  async advancedSearch(queryParams) {
    const { category, maxPrice, keyword, sortBy } = queryParams;
    let query = {};
    if (category) query.category = category;
    if (maxPrice) query.price = { $lte: parseInt(maxPrice) };
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'recommendations': sortOptions = { recommendations: -1 }; break;
      case 'price': sortOptions = { price: 1 }; break;
      default: sortOptions = { createdAt: -1 }; break;
    }

    const menus = await MenuRepository.searchMenus(query, sortOptions);
    return menus.map(this.formatMenu);
  }

  formatMenu(menu) {
    return {
      _id: menu._id,
      name: menu.name,
      price: menu.price,
      description: menu.description,
      username: menu.username,
      restaurantName: menu.restaurantId ? menu.restaurantId.name : 'Unknown Restaurant',
      lat: menu.restaurantId && menu.restaurantId.location ? menu.restaurantId.location.coordinates[1] : null,
      lon: menu.restaurantId && menu.restaurantId.location ? menu.restaurantId.location.coordinates[0] : null,
      recommendations: menu.recommendations,
      disrecommendations: menu.disrecommendations,
      imageUrl: menu.imageUrl,
      category: menu.category,
      createdAt: menu.createdAt,
    };
  }
}

module.exports = new MenuService();