const MenuRepository = require('../repositories/menu.repository');
const UserRepository = require('../repositories/user.repository');
const User = require('../../models/User');
const ApiError = require('../errors/ApiError');

class MenuService {
  // This function replaces createMenuWithNewRestaurant
  async createMenu(menuData, userId, imageUrl) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const newMenu = await MenuRepository.createMenu({
      name: menuData.name,
      price: menuData.price,
      description: menuData.description,
      category: menuData.category,
      username: user.username,
      imageUrl,
      location: {
        type: 'Point',
        coordinates: [parseFloat(menuData.lon), parseFloat(menuData.lat)]
      },
      // address can be added here if provided by frontend in the future
    });

    user.menus.push(newMenu._id);
    await user.save();

    return newMenu;
  }

  async getAllMenus() {
    const menus = await MenuRepository.findAllMenus();
    return menus.map(this.formatMenu);
  }

  async updateMenu(menuId, updateData, file, userId) {
    const requestingUser = await User.findById(userId);
    if (!requestingUser) throw new ApiError(401, 'Unauthorized');

    const menu = await MenuRepository.findMenuById(menuId);
    if (!menu) throw new ApiError(404, 'Menu not found');

    const isOwner = menu.username === requestingUser.username;
    const isAdmin = requestingUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'You do not have permission to update this menu.');
    }

    if (file) {
      updateData.imageUrl = `/uploads/${file.filename}`;
    }
    
    // If location is updated, it should be handled here.
    // For now, assuming location is not updatable from this endpoint.

    const updatedMenu = await MenuRepository.updateMenu(menuId, updateData);
    if (!updatedMenu) throw new ApiError(404, 'Menu not found');
    return updatedMenu;
  }

  async deleteMenu(menuId, userId) {
    const menu = await MenuRepository.findMenuById(menuId);
    if (!menu) throw new ApiError(404, 'Menu not found');

    const requestingUser = await User.findById(userId);
    if (!requestingUser) throw new ApiError(401, 'Unauthorized');

    const isOwner = menu.username === requestingUser.username;
    const isAdmin = requestingUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'You do not have permission to delete this menu.');
    }

    const owner = await User.findOne({ username: menu.username });
    if (owner) {
      owner.menus.pull(menuId);
      await owner.save();
    }

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

  async getMenusByUsername(username) {
    const menus = await MenuRepository.findMenusByUsername(username);
    return menus.map(this.formatMenu);
  }

  formatMenu(menu) {
    const lat = menu.location && menu.location.coordinates ? menu.location.coordinates[1] : null;
    const lon = menu.location && menu.location.coordinates ? menu.location.coordinates[0] : null;

    return {
      _id: menu._id,
      name: menu.name,
      price: menu.price,
      description: menu.description,
      username: menu.username,
      lat,
      lon,
      recommendations: menu.recommendations,
      disrecommendations: menu.disrecommendations,
      imageUrl: menu.imageUrl,
      category: menu.category,
      createdAt: menu.createdAt,
    };
  }
}

module.exports = new MenuService();