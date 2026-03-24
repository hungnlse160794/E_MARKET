import express from 'express';
import { cartController } from '#controllers/cartController.js';
import { cartValidation } from '#validations/cartValidation.js';
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js';
import { validationHandlingMiddleware } from '#middlewares/validationHandlingMiddleware.js';
import { apiRateLimiter } from '#middlewares/rateLimitHandlingMiddleware.js';
import { sanitizeRequest } from '#middlewares/sanitizeRequestMiddleware.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Quản lý giỏ hàng cá nhân và giải pháp Sharing Cart (mua nhóm) cho SaaS
 */

router.use(authHandlingMiddleware); // Toàn bộ route Cart cần đăng nhập

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Xem giỏ hàng cá nhân hiện tại
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về chi tiết giỏ hàng và danh sách thành viên (nếu là Shared Cart)
 */
router.get(
    '/',
    cartController.getCart
);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hoặc cập nhật số lượng nếu đã tồn tại
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, shopId, unitName, quantity, price]
 *             properties:
 *               productId: { type: string, example: "60d5ecfd761595371c8e6d12" }
 *               shopId: { type: string, example: "60d5ecfd761595371c8e6d8a" }
 *               branchId: { type: string, example: "60d5ecfd761595371c8e6abc" }
 *               unitName: { type: string, example: "Đĩa lớn" }
 *               quantity: { type: number, default: 1 }
 *               price: { type: number, example: 55000 }
 *     responses:
 *       200:
 *         description: Thêm thành công
 */
router.post(
    '/items',
    apiRateLimiter,
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(cartValidation.addItem.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(cartValidation.addItem.body)
    ),
    validationHandlingMiddleware(cartValidation.addItem),
    cartController.addItemToCart
);

/**
 * @swagger
 * /cart/{cartId}/items/{itemId}:
 *   patch:
 *     summary: Cập nhật số lượng của một item trong giỏ
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: number, minimum: 1, example: 3 }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Không có quyền thao tác trên giỏ hàng này
 */
router.patch(
    '/:cartId/items/:itemId',
    apiRateLimiter,
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(cartValidation.updateQuantity.body)
    ),
    validationHandlingMiddleware(cartValidation.updateQuantity),
    cartController.updateItemQuantity
);

/**
 * @swagger
 * /cart/{cartId}/items/{itemId}:
 *   delete:
 *     summary: Xóa một sản phẩm khỏi giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete(
    '/:cartId/items/:itemId',
    apiRateLimiter,
    validationHandlingMiddleware(cartValidation.removeItem),
    cartController.removeItem
);

/**
 * @swagger
 * /cart/join:
 *   post:
 *     summary: Tham gia vào giỏ hàng chia sẻ (Shared Cart) bằng roomCode
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roomCode]
 *             properties:
 *               roomCode: { type: string, example: "AB12XY", description: "Mã phòng 6 ký tự viết hoa" }
 *     responses:
 *       200:
 *         description: Thành viên mới đã tham gia thành công
 *       404:
 *         description: Mã phòng không chính xác hoặc giỏ hàng đã đóng
 */
router.post(
    '/join',
    apiRateLimiter,
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(cartValidation.joinSharedCart.body)
    ),
    validationHandlingMiddleware(cartValidation.joinSharedCart),
    cartController.joinSharedCart
);

export default router;
