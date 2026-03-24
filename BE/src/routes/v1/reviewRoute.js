import express from 'express';
import { reviewController } from '#controllers/reviewController.js';
import { reviewValidation } from '#validations/reviewValidation.js';
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js';
import { validationHandlingMiddleware } from '#middlewares/validationHandlingMiddleware.js';
import { apiRateLimiter } from '#middlewares/rateLimitHandlingMiddleware.js';
import { sanitizeRequest } from '#middlewares/sanitizeRequestMiddleware.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Quản lý Đánh giá & Phản hồi từ Khách hàng cho Công ty/Gian hàng
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Tạo đánh giá mới (Review) cho đơn hàng/sản phẩm
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     description: Khách hàng chỉ được đánh giá khi đơn hàng ở trạng thái DELIVERED.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subOrderId, productId, shopId, rating]
 *             properties:
 *               subOrderId: { type: string, example: "60d5ecfd761595371c8e6d12" }
 *               productId: { type: string, example: "60d5ecfd761595371c8e6d01" }
 *               shopId: { type: string, example: "60d5ecfd761595371c8e6d8a" }
 *               rating: { type: number, minimum: 1, maximum: 5, example: 5 }
 *               comment: { type: string, example: "Đồ uống rất ngon, nhân viên nhiệt tình." }
 *               images: { type: array, items: { type: string }, example: ["url_1", "url_2"] }
 *     responses:
 *       201:
 *         description: Đánh giá thành công
 */
router.post(
    '/',
    authHandlingMiddleware,
    apiRateLimiter,
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(reviewValidation.createReview.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(reviewValidation.createReview.body)
    ),
    validationHandlingMiddleware(reviewValidation.createReview),
    reviewController.createReview
);

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Lấy danh sách đánh giá của một sản phẩm
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
    '/product/:productId',
    reviewController.getProductReviews
);

/**
 * @swagger
 * /reviews/shop/{shopId}:
 *   get:
 *     summary: Lấy danh sách đánh giá của một gian hàng
 *     tags: [Reviews]
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
    reviewController.getShopReviews
);

export default router;
