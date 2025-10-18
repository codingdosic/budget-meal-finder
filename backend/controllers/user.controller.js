// backend/controllers/user.controller.js
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');
const UserRepository = require('../repositories/user.repository');
const ApiError = require('../errors/ApiError');
const bcrypt = require('bcrypt');
const MenuRepository = require('../repositories/menu.repository');
const RestaurantRepository = require('../repositories/restaurant.repository');

exports.getCurrentUser = asyncHandler(async (req, res) => {
    // authMiddleware에서 req.user를 설정했으므로 바로 사용
    const user = await UserRepository.findUserById(req.user.userId);

    if (!user) {
        throw new ApiError(404, '사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 필드를 제외하고 사용자 정보 반환
    const { password, ...userData } = user.toObject();
    
    sendSuccess(res, userData, 200);
});

exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await UserRepository.findUserById(userId);
    if (!user) {
        throw new ApiError(404, '사용자를 찾을 수 없습니다.');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new ApiError(401, '현재 비밀번호가 일치하지 않습니다.');
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, '새 비밀번호는 최소 6자 이상이어야 합니다.');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserRepository.updateUserPassword(userId, hashedPassword);

    sendSuccess(res, { message: '비밀번호가 성공적으로 변경되었습니다.' });
});

exports.changeEmail = asyncHandler(async (req, res) => {
    const { newEmail } = req.body;
    const userId = req.user.userId;

    const user = await UserRepository.findUserById(userId);
    if (!user) {
        throw new ApiError(404, '사용자를 찾을 수 없습니다.');
    }

    // Check if new email is already in use by another user
    const existingUserWithEmail = await UserRepository.findUserByEmail(newEmail);
    if (existingUserWithEmail && existingUserWithEmail._id.toString() !== userId) {
        throw new ApiError(400, '이미 사용 중인 이메일 주소입니다.');
    }

    const updatedUser = await UserRepository.updateUserEmail(userId, newEmail);

    // Send the updated user data in the response
    const { password, ...userData } = updatedUser.toObject(); // Exclude password
    sendSuccess(res, userData, 200); // Send updated user data
});

exports.deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const user = await UserRepository.findUserById(userId);
    if (!user) {
        throw new ApiError(404, '사용자를 찾을 수 없습니다.');
    }

    // 1. Delete user's menus
    await MenuRepository.deleteMenusByUsername(user.username);

    // 2. Delete user's restaurants
    await RestaurantRepository.deleteRestaurantsByCreatedBy(userId);

    // 3. Delete the user
    await UserRepository.deleteUser(userId);

    sendSuccess(res, { message: '계정이 성공적으로 삭제되었습니다.' });
});
