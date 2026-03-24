import { NOTIFICATION_REPOSITORY } from '#repositories/notificationRepository.js';
import { getIO } from '#sockets/socketConfig.js';
import { COMMON_CONSTANTS } from '#constants/common.js';

export const notificationService = {
    /**
     * Send Real-time + Persistence Notification
     * @param {Object} data { recipientId, title, content, type, metaData }
     */
    sendNotification: async (data) => {
        const { recipientId, title, content, type, metaData } = data;

        // 1. Lưu vào Database (Persistence)
        const newNotif = await NOTIFICATION_REPOSITORY.create({
            recipientId,
            title,
            content,
            type,
            data: metaData
        });

        // 2. Gửi Real-time qua Socket.io
        try {
            const io = getIO();
            // Gửi cho user qua room cá nhân (userId)
            io.to(recipientId.toString()).emit('new_notification', newNotif);
            
            // Nếu là đơn hàng mới, gửi thêm cho Shop Room
            if (type === COMMON_CONSTANTS.NOTIFICATION_TYPE.NEW_ORDER && metaData?.shopId) {
                io.to(`shop_${metaData.shopId.toString()}`).emit('shop_new_order', newNotif);
            }
        } catch (error) {
            console.error('[Socket] Gửi thông báo real-time thất bại:', error.message);
            // Vẫn trả về thành công vì đã lưu DB được
        }

        return newNotif;
    },

    getMyNotifications: async (recipientId, options) => {
        return await NOTIFICATION_REPOSITORY.findByRecipientId(recipientId, options);
    },

    markAsRead: async (notificationId, recipientId) => {
        return await NOTIFICATION_REPOSITORY.markAsRead(notificationId, recipientId);
    },

    markAllAsRead: async (recipientId) => {
        return await NOTIFICATION_REPOSITORY.markAllAsRead(recipientId);
    },

    deleteNotification: async (notificationId, recipientId) => {
        return await NOTIFICATION_REPOSITORY.deleteById(notificationId, recipientId);
    }
};
