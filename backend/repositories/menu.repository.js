// backend/repositories/menu.repository.js

const Menu = require('../../models/Menu');

class MenuRepository {
  async createMenu(menuData) {
    const menu = new Menu(menuData);
    return await menu.save();
  }

  async findMenuById(menuId) {
    return await Menu.findById(menuId);
  }

  async findAllMenus() {
    return await Menu.find().populate('restaurantId');
  }

  async findMenusByRestaurantId(restaurantId) {
    return await Menu.find({ restaurantId });
  }

  async updateMenu(menuId, updateData) {
    return await Menu.findByIdAndUpdate(menuId, updateData, { new: true });
  }

  async deleteMenu(menuId) {
    return await Menu.findByIdAndDelete(menuId);
  }

  async searchMenus(query, sortOptions) {
    return await Menu.find(query).sort(sortOptions).populate('restaurantId');
  }
}

module.exports = new MenuRepository();
