import express from 'express';
import { chatController } from '#controllers/chatController.js';
import { chatValidation } from '#validations/chatValidation.js';
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js';
import { validationHandlingMiddleware } from '#middlewares/validationHandlingMiddleware.js';
import { apiRateLimiter } from '#middlewares/rateLimitHandlingMiddleware.js';
import { sanitizeRequest } from '#middlewares/sanitizeRequestMiddleware.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Hệ thống Hội thoại trực tuyến (Chat Real-time) giữa Khách và Shop
 */

router.use(authHandlingMiddleware); // Chat cần đăng nhập 100%

/**
 * @swagger
 * /chats/conversation:
 *   post:
 *     summary: Khởi tạo/Lấy lại cuộc hội thoại với một Shop
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shopId]
 *             properties:
 *               shopId: { type: string, example: "60d5ecfd761595371c8e6d8a" }
 *     responses:
 *       200:
 *         description: Trả về chi tiết hội thoại (id, userId, shopId)
 */
router.post(
    '/conversation',
    apiRateLimiter,
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(chatValidation.startConversation.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(chatValidation.startConversation.body)
    ),
    validationHandlingMiddleware(chatValidation.startConversation),
    chatController.getOrCreateConversation
);

/**
 * @swagger
 * /chats/message:
 *   post:
 *     summary: Gửi tin nhắn mới (Chat real-time)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     description: Tích hợp bắn Signal qua Socket.to(conversationId) ngay lập tức.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversationId, text]
 *             properties:
 *               conversationId: { type: string, example: "60d5ecfd761595371c8e6d12" }
 *               text: { type: string, example: "Chào shop, đơn hàng này bao giờ giao thế?" }
 *     responses:
 *       201:
 *         description: Đã gửi tin nhắn (Bằng cả DB và Socket)
 *       403:
 *         description: Bạn không phải người tham gia cuộc hội thoại này
 */
router.post(
    '/message',
    apiRateLimiter,
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(chatValidation.sendMessage.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(chatValidation.sendMessage.body)
    ),
    validationHandlingMiddleware(chatValidation.sendMessage),
    chatController.sendMessage
);

/**
 * @swagger
 * /chats/messages/{conversationId}:
 *   get:
 *     summary: Xem lịch sử tin nhắn của một cuộc hội thoại
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Trả về danh sách tin nhắn phân trang (mới nhất lên đầu)
 */
router.get(
    '/messages/:conversationId',
    validationHandlingMiddleware(chatValidation.getMessages),
    chatController.getMessages
);

/**
 * @swagger
 * /chats/user-conversations:
 *   get:
 *     summary: Lấy danh sách hội thoại của Khách hàng hiện tại
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách các shop đã chat kèm tin nhắn cuối
 */
router.get(
    '/user-conversations',
    chatController.getUserConversations
);

/**
 * @swagger
 * /chats/shop-conversations/{shopId}:
 *   get:
 *     summary: Lấy danh sách các khách hàng đang chat với gian hàng (Dashboard Shop)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
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
    '/shop-conversations/:shopId',
    chatController.getShopConversations
);

export default router;
