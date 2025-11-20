// backend/repositories/user.repository.js

const User = require('../../models/User');

class UserRepository {

  // 사용자 생성
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }


  // --- 사용자 조회 메서드 ---

  // 이메일로 사용자 찾기
  async findUserByEmail(email) {
    return await User.findOne({ email });
  }

  // ID로 사용자 찾기
  async findUserById(userId) {
    return await User.findById(userId);
  }

  // 사용자 이름으로 사용자 찾기
  async findUserByUsername(username) {
    return await User.findOne({ username });
  }


  // --- 사용자 정보 관리 메서드 ---

  // 사용자 이메일 업데이트
  async updateUserEmail(userId, newEmail) {
    return await User.findByIdAndUpdate(userId, { email: newEmail }, { new: true });
  }

  // 사용자 비밀번호 업데이트
  async updateUserPassword(userId, newPassword) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    user.password = newPassword;
    return await user.save();
  }

  // 사용자 삭제
  async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }

  
  // --- 메뉴 관련 메서드 ---

  // 사용자에게 메뉴 추가
  async addMenuToUser(userId, menuId) {
    return await User.findByIdAndUpdate(userId, { $addToSet: { menus: menuId } }, { new: true });
  }

  // 사용자에게서 메뉴 제거
  async removeMenuFromUser(userId, menuId) {
    return await User.findByIdAndUpdate(userId, { $pull: { menus: menuId } }, { new: true });
  }

  // 사용자 추천 메뉴 추가
  async addRecommendedMenuToUser(userId, menuId) {
    return await User.findByIdAndUpdate(userId, { $addToSet: { recommendedMenus: menuId }, $pull: { disrecommendedMenus: menuId } }, { new: true });
  }

  // 사용자 추천 메뉴 제거
  async removeRecommendedMenuFromUser(userId, menuId) {
    return await User.findByIdAndUpdate(userId, { $pull: { recommendedMenus: menuId } }, { new: true });
  }

  // 사용자 비추천 메뉴 추가
  async addDisrecommendedMenuToUser(userId, menuId) {
    return await User.findByIdAndUpdate(userId, { $addToSet: { disrecommendedMenus: menuId }, $pull: { recommendedMenus: menuId } }, { new: true });
  }

  // 사용자 비추천 메뉴 제거
  async removeDisrecommendedMenuFromUser(userId, menuId) {
    return await User.findByIdAndUpdate(userId, { $pull: { disrecommendedMenus: menuId } }, { new: true });
  }

  // 사용자 추천/비추천 메뉴 상태 가져오기
  async getUserRecommendations(userId) {
    return await User.findById(userId).select('recommendedMenus disrecommendedMenus');
  }

}

module.exports = new UserRepository();
