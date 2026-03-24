import express from 'express';
import { stockRequestController } from '#controllers/stockRequestController.js';
import { stockRequestValidation } from '#validations/stockRequestValidation.js';
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js';
import { allowRoles, validateScope } from '#middlewares/permissionMiddleware.js';
import { validationHandlingMiddleware } from '#middlewares/validationHandlingMiddleware.js';
import { apiRateLimiter } from '#middlewares/rateLimitHandlingMiddleware.js';
import { COMMON_CONSTANTS } from '#constants/common.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: StockRequest
 *   description: Quản lý Yêu cầu nhập kho (Replenishment)
 */

router.use(authHandlingMiddleware);

/**
 * @swagger
 * /stock-request/create:
 *   post:
 *     summary: Tạo yêu cầu nhập kho mới (Dành cho Branch Manager)
 *     tags: [StockRequest]
 */
router.post(
    '/create',
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER, COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH),
    validationHandlingMiddleware(stockRequestValidation.createRequest),
    stockRequestController.createRequest
);

/**
 * @swagger
 * /stock-request/status/{id}:
 *   patch:
 *     summary: Cập nhật trạng thái yêu cầu nhập kho (Duyệt/Nhận hàng/Huỷ)
 *     tags: [StockRequest]
 */
router.patch(
    '/status/:id',
    apiRateLimiter,
    allowRoles(
        COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER, 
        COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, 
        COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN
    ),
    validationHandlingMiddleware(stockRequestValidation.updateStatus),
    stockRequestController.updateStatus
);

/**
 * @swagger
 * /stock-request/branch/{branchId}:
 *   get:
 *     summary: Lấy danh sách yêu cầu nhập kho của một chi nhánh
 *     tags: [StockRequest]
 */
router.get(
    '/branch/:branchId',
    allowRoles(
        COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER, 
        COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, 
        COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN
    ),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH),
    validationHandlingMiddleware(stockRequestValidation.getRequestsByBranch),
    stockRequestController.getRequestsByBranch
);

/**
 * @swagger
 * /stock-request/shop/{shopId}:
 *   get:
 *     summary: Lấy danh sách yêu cầu nhập kho toàn hệ thống shop (Dành cho Chủ shop)
 *     tags: [StockRequest]
 */
router.get(
    '/shop/:shopId',
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP),
    validationHandlingMiddleware(stockRequestValidation.getRequestsByShop),
    stockRequestController.getRequestsByShop
);

export default router;
