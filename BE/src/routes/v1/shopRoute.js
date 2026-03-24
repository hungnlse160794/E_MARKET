import express from 'express';

import { shopController } from '#controllers/shopController.js';
import { shopValidation } from '#validations/shopValidation.js';
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js';
import { allowRoles, validateScope } from '#middlewares/permissionMiddleware.js';
import { validationHandlingMiddleware } from '#middlewares/validationHandlingMiddleware.js';
import { sanitizeRequest } from '#middlewares/sanitizeRequestMiddleware.js';
import { authRateLimiter, apiRateLimiter } from '#middlewares/rateLimitHandlingMiddleware.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Shops
 *   description: Quản lý gian hàng (Shop Module)
 */

/**
 * @swagger
 * /shops:
 *   post:
 *     summary: Tạo gian hàng mới (Tự động nâng cấp người dùng thành SHOP_OWNER)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, category]
 *             properties:
 *               name: { type: string, example: "Bún Bò Chú 6" }
 *               address: { type: string, example: "123 Đường ABC, Quận 1, TP.HCM" }
 *               description: { type: string, example: "Bún bò gia truyền cực ngon" }
 *               category: { type: string, enum: [FOOD, FASHION, ELECTRONICS, OTHER], example: "FOOD" }
 *     responses:
 *       201:
 *         description: Tạo shop thành công
 *       400:
 *         description: Tên shop đã tồn tại hoặc dữ liệu không hợp lệ
 */
router.post(
    '/',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.CUSTOMER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(shopValidation.createShop.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(shopValidation.createShop.body)
    ),
    validationHandlingMiddleware(shopValidation.createShop),
    shopController.createShop
);

/**
 * @swagger
 * /shops/my-shops:
 *   get:
 *     summary: Lấy danh sách gian hàng tôi đang quản lý
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(
    '/my-shops',
    authHandlingMiddleware,
    allowRoles(
        COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN,
        COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER,
        COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER,
        COMMON_CONSTANTS.USER_ROLE.STAFF
    ),
    shopController.getMyShop
);

/**
 * @swagger
 * /shops/{id}:
 *   get:
 *     summary: Lấy chi tiết gian hàng theo ID
 *     tags: [Shops]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(
    '/:id',
    authHandlingMiddleware,
    validationHandlingMiddleware(shopValidation.getShopById),
    shopController.getShopById
);

/**
 * @swagger
 * /shops/{id}/verify:
 *   patch:
 *     summary: Duyệt/Cập nhật trạng thái gian hàng (Dành cho Admin/Manager)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [ACTIVE, INACTIVE, PENDING], example: "ACTIVE" }
 *               isVerified: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền thực hiện
 */
router.patch(
    '/:id/verify',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(shopValidation.verifyShop.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(shopValidation.verifyShop.body)
    ),
    validationHandlingMiddleware(shopValidation.verifyShop),
    shopController.verifyShop
);

/**
 * @swagger
 * /shops/{shopId}/accounts:
 *   post:
 *     summary: Tạo tài khoản cho Nhân viên (STAFF) hoặc Quản lý chi nhánh (BRANCH_MANAGER)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password, role]
 *             properties:
 *               fullName: { type: string, example: "Nguyen Van A" }
 *               email: { type: string, example: "staff@example.com" }
 *               password: { type: string, example: "password123" }
 *               phone: { type: string, example: "0987654321" }
 *               role: { type: string, enum: [STAFF, BRANCH_MANAGER], example: "STAFF" }
 *               branchId: { type: string, example: "60d0fe4f5311236168a109cb" }
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 *       403:
 *         description: Không có quyền truy cập gian hàng này
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc email đã tồn tại
 */
router.post(
    '/:shopId/accounts',
    authHandlingMiddleware,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP), // Middleware sẽ tự kiểm tra req.params.shopId
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(shopValidation.createAccount.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(shopValidation.createAccount.body)
    ),
    validationHandlingMiddleware(shopValidation.createAccount),
    shopController.createShopAccount
);

/**
 * @swagger
 * /shops/{shopId}/accounts/{userId}:
 *   patch:
 *     summary: Cập nhật tài khoản Nhân sự
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Thành công
 */
router.patch(
    '/:shopId/accounts/:userId',
    authHandlingMiddleware,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP),
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(shopValidation.createAccount.body),
        [] // No fields are strictly required for patch
    ),
    shopController.updateShopAccount
);

/**
 * @swagger
 * /shops/{shopId}/accounts/{userId}/branches:
 *   patch:
 *     summary: Cập nhật danh sách chi nhánh quản lý (Dành cho Manager)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *       - in: path
 *         name: userId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [managedBranches]
 *             properties:
 *               managedBranches: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Thành công
 */
router.patch(
    '/:shopId/accounts/:userId/branches',
    authHandlingMiddleware,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP),
    validationHandlingMiddleware(shopValidation.updateAccount),
    shopController.updateManagedBranches
);

/**
 * @swagger
 * /shops/{shopId}/accounts/{userId}:
 *   delete:
 *     summary: Xóa tài khoản nhân sự
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete(
    '/:shopId/accounts/:userId',
    authHandlingMiddleware,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP),
    shopController.deleteShopAccount
);

/**
 * @swagger
 * /shops/{shopId}/accounts:
 *   get:
 *     summary: Lấy danh sách tài khoản nhân sự của Shop
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trả về danh sách tài khoản
 */
router.get(
    '/:shopId/accounts',
    authHandlingMiddleware,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP),
    shopController.getShopAccounts
);

router.get(
    '/:shopId/accounts/:userId',
    authHandlingMiddleware,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP),
    shopController.getShopAccountById
);

/**
 * @swagger
 * /shops/dashboard/metrics:
 *   get:
 *     summary: Lấy chỉ số hiệu năng của Shop (Chi nhánh, nhân viên,...)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(
   '/dashboard/metrics',
   authHandlingMiddleware,
   allowRoles(
      COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN,
      COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER,
      COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER,
      COMMON_CONSTANTS.USER_ROLE.STAFF
   ),
   shopController.getDashboardMetrics
);

export default router;
