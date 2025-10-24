const User = require('../../models/User');
const Menu = require('../../models/Menu');

class AdminService {
  /**
   * 모든 사용자를 조회하거나 검색 쿼리가 있는 경우 필터링합니다.
   * @param {string} searchQuery - 사용자 이름 또는 이메일로 검색할 쿼리
   * @returns {Promise<User[]>}
   */
  static async getAllUsers(searchQuery) {
    let query = {};
    if (searchQuery) {
      query = {
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
        ],
      };
    }
    return User.find(query).select('-password');
  }

  /**
   * 특정 사용자의 모든 메뉴를 조회합니다.
   * @param {string} userId - 메뉴를 조회할 사용자의 ID
   * @returns {Promise<Menu[]>}
   */
  static async getUserMenus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      return [];
    }
    return Menu.find({ username: user.username });
  }
}

module.exports = AdminService;
