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
}

module.exports = new UserRepository();
