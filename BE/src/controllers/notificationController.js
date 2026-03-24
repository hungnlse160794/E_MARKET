import { catchAsync } from '#utils/catchAsync.js';
import { notificationService } from '#services/notificationService.js';

export const notificationController = {
    getMyNotifications: catchAsync(async (req, res) => {
        const { page = 1, limit = 20 } = req.query;
        const result = await notificationService.getMyNotifications(req.user.userId, { page, limit });
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách thông báo thành công',
            data: result
        });
    }),

    markAsRead: catchAsync(async (req, res) => {
        const { id } = req.params;
        const result = await notificationService.markAsRead(id, req.user.userId);
        res.status(200).json({
            success: true,
            message: 'Đã đánh dấu thông báo đã đọc',
            data: result
        });
    }),

    markAllAsRead: catchAsync(async (req, res) => {
        await notificationService.markAllAsRead(req.user.userId);
        res.status(200).json({
            success: true,
            message: 'Đã đánh dấu tất cả thông báo đã đọc'
        });
    }),

    deleteNotification: catchAsync(async (req, res) => {
        const { id } = req.params;
        await notificationService.deleteNotification(id, req.user.userId);
        res.status(200).json({
            success: true,
            message: 'Đã xóa thông báo'
        });
    })
};
