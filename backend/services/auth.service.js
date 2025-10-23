// backend/services/auth.service.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserRepository = require('../repositories/user.repository');
const ApiError = require('../errors/ApiError');

class AuthService {

  // 가입 비즈니스 로직
  async register(userData) {
    const { username, email, password } = userData;

    // 사용자 중복 확인
    const existingUser = await UserRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const user = await UserRepository.createUser({ username, email, password });
    return { id: user._id, username: user.username, email: user.email };
  }

  // 관리자 가입 비즈니스 로직
  async registerAdmin(userData) {
    const { username, email, password, securityCode } = userData;

    // 보안 코드 확인
    if (securityCode !== process.env.ADMIN_REGISTRATION_SECRET) {
      throw new ApiError(403, 'Invalid security code.');
    }

    // 사용자 중복 확인
    const existingUser = await UserRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const user = await UserRepository.createUser({ username, email, password, role: 'admin' });
    return { id: user._id, username: user.username, email: user.email, role: user.role };
  }


  async login(email, password) {
    const user = await UserRepository.findUserByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { token, username: user.username };
  }


  async resetPassword(email) {
    const user = await UserRepository.findUserByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User with this email does not exist.');
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    await UserRepository.updateUserPassword(user._id, tempPassword);

    return { tempPassword };
  }
}

module.exports = new AuthService();