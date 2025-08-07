// backend/repositories/user.repository.js

const User = require('../../models/User');

class UserRepository {
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findUserByEmail(email) {
    return await User.findOne({ email });
  }
}

module.exports = new UserRepository();
