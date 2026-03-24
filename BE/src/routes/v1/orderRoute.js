import express from 'express';
import { orderController } from '#controllers/orderController.js';
import { orderValidation } from '#validations/orderValidation.js';
import { checkoutValidation } from '#validations/checkoutValidation.js'; // Senior BA Optimized Validation
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js';
import { allowRoles, validateScope } from '#middlewares/permissionMiddleware.js';
import { validationHandlingMiddleware } from '#middlewares/validationHandlingMiddleware.js';
import { apiRateLimiter } from '#middlewares/rateLimitHandlingMiddleware.js';
import { sanitizeRequest } from '#middlewares/sanitizeRequestMiddleware.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';

const router = express.Router();

// --- Public Routes for Payment Gateway ---
router.get('/vnpay-return', orderController.vnpayReturn);
router.get('/vnpay-ipn', orderController.vnpayIpn);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý Quy trình Thanh toán (Checkout) và Vòng đời Đơn hàng SaaS
 */

router.use(authHandlingMiddleware);

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Thực hiện Thanh toán hoàn tất (Checkout) - Chia đơn đa gian hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cartId, paymentMethod, shippingAddress]
 *             properties:
 *               cartId: { type: string, example: "60d5ecfd761595371c8e6d12" }
 *               paymentMethod: { type: string, enum: [COD, VNPAY, WALLET] }
 *               shippingAddress: { type: object, example: { title: "Nhà", fullAddress: "Số 1 Trần Duy Hưng" } }
 *               vouchers: { type: array, items: { type: string }, example: ["SAMSUMMER", "FOODFREESHIP"] }
 *               note: { type: string, example: "Cho ít ớt thôi ạ" }
 *     responses:
 *       201:
 *         description: Đơn hàng đã được tạo thành công
 *       400:
 *         description: Số dư ví không đủ hoặc tồn kho chi nhánh đã hết
 */
router.post(
    '/checkout',
    apiRateLimiter,
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(checkoutValidation.checkout.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(checkoutValidation.checkout.body)
    ),
    validationHandlingMiddleware(checkoutValidation.checkout),
    orderController.checkout
);

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Xem lịch sử đơn hàng của bản thân (Khách hàng)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Trả về danh sách Parent Orders
 */
router.get(
    '/my-orders',
    orderController.getMyOrders
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Xem chi tiết chi tiết Đơn hàng mẹ (Parent Order) và các đơn con (Sub Orders)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
    '/:id',
    validationHandlingMiddleware(orderValidation.getOrderById),
    orderController.getParentOrderById
);

/**
 * @swagger
 * /orders/sub-order/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái Đơn hàng con (Shop Owner hoặc Branch Manager)
 *     tags: [Orders]
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [CONFIRMED, PREPARING, SHIPPING, DELIVERED, CANCELLED] }
 *     responses:
 *       200:
 *         description: Cập nhật thành công, khách hàng nhận được thông báo real-time
 *       403:
 *         description: Không có quyền cập nhật đơn hàng của shop này
 */
router.patch(
    '/sub-order/:id/status',
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    // ValidateScope BRANCH sẽ được xử lý trong logic nếu cần nâng cấp (SaaS Đa chi nhánh)
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(orderValidation.updateStatus.body)
    ),
    validationHandlingMiddleware(orderValidation.updateStatus),
    orderController.updateSubOrderStatus
);

export default router;
