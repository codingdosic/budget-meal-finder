// backend/controllers/user.controller.js
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');
const UserService = require('../services/user.service');

class UserController{

    getCurrentUser = asyncHandler(async (req, res) => {

        // authMiddleware에서 req.user를 설정했으므로 바로 사용
        const user = await UserService.getCurrentUser(req.user.userId);
        sendSuccess(res, user, 200);
    });


    changePassword = asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        await UserService.changePassword(userId, currentPassword, newPassword);

        sendSuccess(res, { message: '비밀번호가 성공적으로 변경되었습니다.' });
    });

    changeEmail = asyncHandler(async (req, res) => {
        const { newEmail } = req.body;
        const userId = req.user.userId;

        const user = await UserService.changeEmail(userId, newEmail);
        
        sendSuccess(res, user, 200); // Send updated user data
    });

    deleteAccount = asyncHandler(async (req, res) => {
        const userId = req.user.userId;

        await UserService.deleteAccount(userId);

        sendSuccess(res, { message: '계정이 성공적으로 삭제되었습니다.' });
    });
}

module.exports = new UserController();
