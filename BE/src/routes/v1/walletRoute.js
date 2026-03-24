import express from 'express';
import { walletController } from '#controllers/walletController.js';
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js';
import { allowRoles, validateScope } from '#middlewares/permissionMiddleware.js';
import { apiRateLimiter } from '#middlewares/rateLimitHandlingMiddleware.js';
import { COMMON_CONSTANTS } from '#constants/common.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wallets
 *   description: Quản lý Ví điện tử & Hệ thống Escrow (Tiền treo) tài chính cho Shop
 */

router.use(authHandlingMiddleware);

/**
 * @swagger
 * /wallets/shop/{shopId}:
 *   get:
 *     summary: Lấy thông tin số dư Ví của gian hàng (Dành cho Shop Owner)
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trả về chi tiết balance, frozenBalance (tiền đang treo đơn hàng)
 *       403:
 *         description: Bạn không sở hữu ví này
 */
router.get(
    '/shop/:shopId',
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP), // Xác thực người dùng thực sự sở hữu shopId này
    walletController.getWalletByShop
);

/**
 * @swagger
 * /wallets/sub-order/{id}/complete:
 *   post:
 *     summary: Quyết toán đơn hàng sang Số dư thực tế (Platform Admin Only)
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     description: Hệ thống gọi tự động khi shipper xác nhận giao hàng thành công để giải phóng tiền treo đơn
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, description: "ID đơn hàng con (SubOrder ID)" }
 *     responses:
 *       200:
 *         description: Tiền đã được cập nhật thành công vào Balance khả dụng
 *       403:
 *         description: Chỉ Admin sàn mới có quyền quyết toán tài chính
 */
router.post(
    '/sub-order/:id/complete',
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    walletController.completeSubOrder
);

/**
 * @swagger
 * /wallets/shop/{shopId}/withdraw:
 *   post:
 *     summary: Yêu cầu rút tiền từ Ví (Dành cho Shop Owner)
 *     tags: [Wallets]
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
 *             required: [amount]
 *             properties:
 *               amount: { type: number, example: 50000 }
 *     responses:
 *       200:
 *         description: Yêu cầu rút tiền thành công
 *       400:
 *         description: Số dư không đủ hoặc số tiền rút quá nhỏ
 *       403:
 *         description: Bạn không sở hữu ví này
 */
router.post(
    '/shop/:shopId/withdraw',
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP),
    walletController.requestWithdrawal
);

/**
 * @swagger
 * /wallets/transactions/{txnId}/review:
 *   post:
 *     summary: Phê duyệt hoặc từ chối yêu cầu rút tiền (Platform Admin Only)
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: txnId
 *         required: true
 *         schema: { type: string, description: "ID của Giao dịch Rút tiền" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action: { type: string, enum: ['APPROVE', 'REJECT'] }
 *     responses:
 *       200:
 *         description: Đã xử lý yêu cầu rút tiền
 *       403:
 *         description: Chỉ Admin sàn mới có quyền can thiệp
 */
router.post(
    '/transactions/:txnId/review',
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN, COMMON_CONSTANTS.USER_ROLE.SUPER_ADMIN),
    walletController.reviewWithdrawal
);

/**
 * @swagger
 * /wallets/system-wallet:
 *   get:
 *     summary: Lấy dữ liệu Ví Sàn (Only Super Admin)
 *     tags: [Wallets]
 */
router.get(
    '/system-wallet',
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SUPER_ADMIN),
    walletController.getSystemWallet
);

/**
 * @swagger
 * /wallets/{id}/bank-info:
 *   patch:
 *     summary: Cập nhật thông tin ngân hàng (Shop Owner hoặc Super Admin cho Ví Sàn)
 *     tags: [Wallets]
 */
router.patch(
    '/:id/bank-info',
    apiRateLimiter,
    walletController.updateBankInfo
);

export default router;
