// backend/repositories/user.repository.js

const User = require('../../models/User');

class UserRepository {

  // 사용자 생성
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  // 이메일로 사용자 찾기
  async findUserByEmail(email) {
    return await User.findOne({ email });
  }

  // ID로 사용자 찾기
  async findUserById(userId) {
    return await User.findById(userId);
  }

  // 사용자 비밀번호 업데이트
  async updateUserPassword(userId, newHashedPassword) {
    return await User.findByIdAndUpdate(userId, { password: newHashedPassword }, { new: true });
  }

  // 사용자 이메일 업데이트
  async updateUserEmail(userId, newEmail) {
    return await User.findByIdAndUpdate(userId, { email: newEmail }, { new: true });
  }

  // 사용자 삭제
  async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }
}

module.exports = new UserRepository();
