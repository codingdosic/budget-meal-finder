const AdminService = require('../services/admin.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHandler');

class AdminController {
  /**
   * 모든 사용자를 가져오거나 검색 쿼리를 기반으로 필터링합니다.
   */
  static getAllUsers = asyncHandler(async (req, res) => {
    const { search } = req.query;
    const users = await AdminService.getAllUsers(search);
    sendSuccess(res, users);
  });

  /**
   * 특정 사용자의 모든 메뉴를 가져옵니다.
   */
  static getUserMenus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const menus = await AdminService.getUserMenus(userId);
    sendSuccess(res, menus);
  });
}

module.exports = AdminController;
