// backend/services/auth.service.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserRepository = require('../repositories/user.repository');
const ApiError = require('../errors/ApiError');

class AuthService {
  async register(userData) {
    const { username, email, password } = userData;

    // Check if user already exists
    const existingUser = await UserRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserRepository.createUser({ username, email, password: hashedPassword });
    return { id: user._id, username: user.username, email: user.email };
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
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await UserRepository.updateUserPassword(user._id, hashedPassword);

    return { tempPassword };
  }
}

module.exports = new AuthService();