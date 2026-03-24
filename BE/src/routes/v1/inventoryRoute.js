import express from 'express';
import { inventoryController } from '#controllers/inventoryController.js';
import { inventoryValidation } from '#validations/inventoryValidation.js';
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js';
import { allowRoles, validateScope } from '#middlewares/permissionMiddleware.js';
import { validationHandlingMiddleware } from '#middlewares/validationHandlingMiddleware.js';
import { apiRateLimiter } from '#middlewares/rateLimitHandlingMiddleware.js';
import { sanitizeRequest } from '#middlewares/sanitizeRequestMiddleware.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Quản lý Kho bãi & Tồn kho đa chi nhánh (SaaS Multi-Branch)
 */

router.use(authHandlingMiddleware); // Cần đăng nhập để quản lý kho

/**
 * @swagger
 * /inventory/update:
 *   post:
 *     summary: Cập nhật biến động tồn kho (Nhập/Xuất/Điều chỉnh) cho một chi nhánh
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, branchId, stockQuantity]
 *             properties:
 *               productId: { type: string, example: "60d5ecfd761595371c8e6d12" }
 *               branchId: { type: string, example: "60d5ecfd761595371c822222" }
 *               stockQuantity: { type: number, example: 50, description: "Giá trị dương" }
 *               type: { type: string, enum: [ADD, SUBTRACT, SET], default: "ADD" }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Bạn không có quyền quản lý kho cho chi nhánh này
 */
router.post(
    '/update',
    apiRateLimiter,
    allowRoles(
        COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER,
        COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER,
        COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN
    ),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH), // Xác nhận quyền tại branchId này
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(inventoryValidation.updateStock.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(inventoryValidation.updateStock.body)
    ),
    validationHandlingMiddleware(inventoryValidation.updateStock),
    inventoryController.updateStock
);

/**
 * @swagger
 * /inventory/branch/{branchId}:
 *   get:
 *     summary: Lấy danh sách tồn kho toàn bộ sản phẩm của một chi nhánh
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trả về danh sách {productId, stockQuantity, reservedStock}
 */
router.get(
    '/branch/:branchId',
    allowRoles(
        COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER,
        COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER,
        COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN
    ),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH),
    validationHandlingMiddleware(inventoryValidation.getInventoryByBranch),
    inventoryController.getInventoryByBranch
);

/**
 * @swagger
 * /inventory/shop/{shopId}:
 *   get:
 *     summary: Lấy danh sách tồn kho toàn bộ sản phẩm của một Shop (tất cả chi nhánh)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trả về danh sách {productId, stockQuantity, branchId...}
 */
router.get(
    '/shop/:shopId',
    allowRoles(
        COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER,
        COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN
    ),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP),
    validationHandlingMiddleware(inventoryValidation.getInventoryByShop),
    inventoryController.getInventoryByShop
);

/**
 * @swagger
 * /inventory/low-stock/{branchId}:
 *   get:
 *     summary: Lấy danh sách sản phẩm sắp hết kho của một chi nhánh
 *     tags: [Inventory]
 */
router.get(
    '/low-stock/:branchId',
    allowRoles(
        COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER,
        COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER,
        COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN
    ),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH),
    validationHandlingMiddleware(inventoryValidation.getLowStockByBranch),
    inventoryController.getLowStockByBranch
);

/**
 * @swagger
 * /inventory/low-stock/shop/{shopId}:
 *   get:
 *     summary: Lấy danh sách sản phẩm sắp hết kho toàn Shop (tất cả chi nhánh)
 *     tags: [Inventory]
 */
router.get(
    '/low-stock/shop/:shopId',
    allowRoles(
        COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER,
        COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN
    ),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP),
    validationHandlingMiddleware(inventoryValidation.getLowStockByShop),
    inventoryController.getLowStockByShop
);

/**
 * @swagger
 * /inventory/history/{branchId}:
 *   get:
 *     summary: Lấy lịch sử biến động kho của một chi nhánh
 *     tags: [Inventory]
 */
router.get(
    '/history/:branchId',
    allowRoles(
        COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER,
        COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER,
        COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN
    ),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH),
    validationHandlingMiddleware(inventoryValidation.getHistoryByBranch),
    inventoryController.getHistoryByBranch
);

/**
 * @swagger
 * /inventory/history/shop/{shopId}:
 *   get:
 *     summary: Lấy lịch sử biến động kho toàn Shop (tất cả chi nhánh)
 *     tags: [Inventory]
 */
router.get(
    '/history/shop/:shopId',
    allowRoles(
        COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER,
        COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN
    ),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP),
    validationHandlingMiddleware(inventoryValidation.getHistoryByShop),
    inventoryController.getHistoryByShop
);

/**
 * @swagger
 * /inventory/threshold:
 *   post:
 *     summary: Thiết lập ngưỡng cảnh báo tồn kho thấp
 *     tags: [Inventory]
 */
router.post(
    '/threshold',
    allowRoles(
        COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER,
        COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER,
        COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN
    ),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH),
    validationHandlingMiddleware(inventoryValidation.setThreshold),
    inventoryController.setThreshold
);

export default router;
