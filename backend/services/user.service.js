// backend/services/user.service.js

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');
const UserRepository = require('../repositories/user.repository');
const ApiError = require('../errors/ApiError');
const bcrypt = require('bcrypt');
const MenuRepository = require('../repositories/menu.repository');

class UserService {

    async getCurrentUser(userId) {

        const user = await UserRepository.findUserById(userId);

        // 사용자 없을 경우 에러 처리
        if (!user) {
            throw new ApiError(404, '사용자를 찾을 수 없습니다.');
        }

        // mongoose document 객체를 js객체로 변환하고, 비밀번호 + 나머지 필드의 형태로 사용자 정보 반환
        const { password, ...userData } = user.toObject();

        return userData;
    }

    async changePassword(userId, currentPassword, newPassword) {

        const user = await UserRepository.findUserById(userId);

        if (!user) {
            throw new ApiError(404, '사용자를 찾을 수 없습니다.');
        }

        // 비밀번호 일치 여부 확인
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new ApiError(401, '현재 비밀번호가 일치하지 않습니다.');
        }

        // 비밀번호 유효성 검사
        if (newPassword.length < 6) {
            throw new ApiError(400, '새 비밀번호는 최소 6자 이상이어야 합니다.');
        }

        // 비밀번호 해싱
        await UserRepository.updateUserPassword(userId, newPassword);
    }

    async changeEmail(userId, newEmail) {

        const user = await UserRepository.findUserById(userId);

        if (!user) {
            throw new ApiError(404, '사용자를 찾을 수 없습니다.');
        }

        // 이메일 중복 여부 확인
        const existingUserWithEmail = await UserRepository.findUserByEmail(newEmail);

        // 다른 사람의 이메일일 경우 에러 처리
        if (existingUserWithEmail && existingUserWithEmail._id.toString() !== userId) {
            throw new ApiError(400, '이미 사용 중인 이메일 주소입니다.');
        }

        // 이메일 업데이트
        const updatedUser = await UserRepository.updateUserEmail(userId, newEmail);

        // 사용자 정보 반환
        const { password, ...userData } = updatedUser.toObject(); 

        return userData
    }

    async deleteAccount(userId) {

        const user = await UserRepository.findUserById(userId);

        if (!user) {
            throw new ApiError(404, '사용자를 찾을 수 없습니다.');
        }

        // 사용자가 등록한 메뉴 삭제
        await MenuRepository.deleteMenusByUsername(user.username);

        // 사용자 정보 삭제
        await UserRepository.deleteUser(userId);
    }
}

module.exports = new UserService();