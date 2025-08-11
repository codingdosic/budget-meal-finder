// backend/services/auth.service.js

const UserRepository = require('../repositories/user.repository');
const ApiError = require('../errors/ApiError');
const jwt = require('jsonwebtoken');

class AuthService {

  // 프로미스 반환하는 비동기 함수
  async register(userData) {
    // 이메일 중복 체크
    const existingUser = await UserRepository.findUserByEmail(userData.email);
    if (existingUser) {
      throw new ApiError(400, 'Email already exists');
    }
    return await UserRepository.createUser(userData);
  }

  async login(email, password) {
    const user = await UserRepository.findUserByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials'); // 401 Unauthorized
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials'); // 401 Unauthorized
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { token, user };
  }
}

module.exports = new AuthService();