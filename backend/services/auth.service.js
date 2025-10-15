// backend/services/auth.service.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const ApiError = require('../errors/ApiError');

class AuthService {
  async register(userData) {
    const { username, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    return { id: user._id, username: user.username, email: user.email };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
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
    const user = await User.findOne({ email });
    if (!user) {
      // To prevent email enumeration, we can return a success message even if the user is not found.
      // However, for this development simulation, we'll throw an error.
      throw new ApiError(404, 'User with this email does not exist.');
    }

    // Generate a random temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Use findOneAndUpdate for a more robust, atomic update
    await User.findOneAndUpdate({ _id: user._id }, { password: hashedPassword });

    // In a real application, you would email this password to the user.
    // For development, we return it directly.
    return { tempPassword };
  }
}

module.exports = new AuthService();