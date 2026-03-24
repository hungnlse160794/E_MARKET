import { Notification } from '#models/notificationModel.js';

export const NOTIFICATION_REPOSITORY = {
    create: async (notificationData) => {
        const notification = new Notification(notificationData);
        return await notification.save();
    },

    findByRecipientId: async (recipientId, options = {}) => {
        const { page = 1, limit = 20 } = options;
        return await Notification.paginate({ recipientId }, { page, limit, sort: { createdAt: -1 } });
    },

    markAsRead: async (notificationId, recipientId) => {
        return await Notification.findOneAndUpdate(
            { _id: notificationId, recipientId },
            { isRead: true },
            { new: true }
        ).lean();
    },

    markAllAsRead: async (recipientId) => {
        return await Notification.updateMany(
            { recipientId, isRead: false },
            { isRead: true }
        );
    },

    deleteById: async (notificationId, recipientId) => {
        return await Notification.deleteOne({ _id: notificationId, recipientId });
    },

    countUnread: async (recipientId) => {
        return await Notification.countDocuments({ recipientId, isRead: false });
    }
};
