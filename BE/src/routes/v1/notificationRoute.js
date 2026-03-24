import express from 'express';
import { notificationController } from '#controllers/notificationController.js';
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Quản lý Thông báo cá nhân (Alert Center) cho khách hàng & chủ shop
 */

router.use(authHandlingMiddleware); // Cần đăng nhập để xem thông báo

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Lấy danh sách thông báo cá nhân phân trang
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Trả về danh sách thông báo và trạng thái đọc/chưa đọc
 */
router.get('/', notificationController.getMyNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Đánh dấu một thông báo là đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch('/:id/read', notificationController.markAsRead);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Đánh dấu tất cả thông báo hiện có là đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đã đánh dấu tất cả thành công
 */
router.patch('/read-all', notificationController.markAllAsRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Xóa vĩnh viễn một thông báo
 *     tags: [Notifications]
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
router.delete('/:id', notificationController.deleteNotification);

export default router;
