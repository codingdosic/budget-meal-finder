// backend/controllers/user.controller.js
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');
const UserRepository = require('../repositories/user.repository');
const ApiError = require('../errors/ApiError');

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
