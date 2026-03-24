import express from 'express';
import { voucherController } from '#controllers/voucherController.js';
import { voucherValidation } from '#validations/voucherValidation.js';
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
 *   name: Vouchers
 *   description: Quản lý mã giảm giá (Sàn & Gian hàng) cho mô hình SaaS
 */

/**
 * @swagger
 * /vouchers:
 *   post:
 *     summary: Tạo Voucher mới (Admin hoặc Shop Owner)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, discountType, discountValue, startDate, endDate]
 *             properties:
 *               code: { type: string, example: "SUMMER2026" }
 *               shopId: { type: string, example: "60d5ecfd761595371c8e6d8a", description: "Để trống nếu là voucher sàn" }
 *               discountType: { type: string, enum: [FIXED, PERCENTAGE] }
 *               discountValue: { type: number, example: 50000 }
 *               minOrderValue: { type: number, example: 200000 }
 *               maxDiscount: { type: number, example: 100000 }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *               usageLimit: { type: number, default: 100 }
 *     responses:
 *       201:
 *         description: Tạo voucher thành công
 *       403:
 *         description: Không có quyền tạo voucher cho gian hàng này
 */
router.post(
    '/',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP), // Check shopId trong body nếu có
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(voucherValidation.createVoucher.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(voucherValidation.createVoucher.body)
    ),
    validationHandlingMiddleware(voucherValidation.createVoucher),
    voucherController.createVoucher
);

/**
 * @swagger
 * /vouchers/platform:
 *   get:
 *     summary: Lấy danh sách Voucher của hệ thống (Sàn)
 *     tags: [Vouchers]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
    '/platform',
    voucherController.getPlatformVouchers
);

/**
 * @swagger
 * /vouchers/shop/{shopId}:
 *   get:
 *     summary: Lấy danh sách Voucher của một gian hàng cụ thể
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
    '/shop/:shopId',
    voucherController.getShopVouchers
);

/**
 * @swagger
 * /vouchers/{code}:
 *   get:
 *     summary: Tra cứu thông tin chi tiết Voucher theo mã
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Voucher không tồn tại
 */
router.get(
    '/:code',
    voucherController.getVoucherByCode
);

/**
 * @swagger
 * /vouchers/{id}:
 *   patch:
 *     summary: Cập nhật thông tin Voucher
 *     tags: [Vouchers]
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
 *               discountValue: { type: number }
 *               endDate: { type: string, format: date-time }
 *               usageLimit: { type: number }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch(
    '/:id',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    // Ownership check sẽ được xử lý sâu trong Service dựa trên shopId của voucher hiện tại
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(voucherValidation.updateVoucher.body)
    ),
    validationHandlingMiddleware(voucherValidation.updateVoucher),
    voucherController.updateVoucher
);

/**
 * @swagger
 * /vouchers/{id}:
 *   delete:
 *     summary: Xóa Voucher
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete(
    '/:id',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    voucherController.deleteVoucher
);

export default router;
