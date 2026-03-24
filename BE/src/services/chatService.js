import { CHAT_REPOSITORY } from '#repositories/chatRepository.js';
import { SHOP_REPOSITORY } from '#repositories/shopRepository.js';
import { getIO } from '#sockets/socketConfig.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import ApiError from '#utils/ApiError.js';
import { sanitizeHtml } from '#utils/sanitizeHtmlUtil.js';
import { COMMON_CONSTANTS } from '#constants/common.js';

export const chatService = {
    /**
     * Khởi tạo hoặc lấy lại cuộc hội thoại giữa User và Shop
     */
    getOrCreateConversation: async (userId, shopId) => {
        let conversation = await CHAT_REPOSITORY.findConversation(userId, shopId);
        if (!conversation) {
            conversation = await CHAT_REPOSITORY.createConversation(userId, shopId);
        }
        return conversation;
    },

    /**
     * Gửi tin nhắn thực tế qua API và Real-time Socket
     */
    sendMessage: async (messageData, requestUser) => {
        const { conversationId, text } = messageData;

        // 1. Kiểm tra Quyền trong Hội thoại
        const conversation = await CHAT_REPOSITORY.findConversationById(conversationId);
        if (!conversation) throw new ApiError(ERROR_CODES.NOT_FOUND, ['Hội thoại không tồn tại']);

        // Phải là User (Khách) hoặc ShopOwner quản lý cụ thể shopId này
        const isUserParticipant = conversation.userId.toString() === requestUser.userId.toString();
        
        let isShopParticipant = false;
        if (requestUser.shopId && conversation.shopId.toString() === requestUser.shopId.toString()) {
            isShopParticipant = true;
        } else if (requestUser.managedShops?.includes(conversation.shopId)) {
            isShopParticipant = true;
        }

        if (!isUserParticipant && !isShopParticipant && requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
            throw new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền tham gia hội thoại này']);
        }

        // 2. Chống XSS cho tin nhắn văn bản
        const sanitizedText = sanitizeHtml(text);

        // 3. Lưu vào DB
        const newMessage = await CHAT_REPOSITORY.createMessage({
            conversationId,
            senderId: requestUser.userId,
            text: sanitizedText
        });

        // 4. Bắn Signal Real-time qua Socket
        try {
            const io = getIO();
            // Gửi tới Room Hội thoại chung cho cả 2 bên (Tránh bắn lẻ tẻ)
            io.to(conversationId.toString()).emit('new_message', newMessage);

            // Hoặc gửi trực tiếp cho người nhận (để báo chuông thông báo ngoài màn hình chat)
            const recipientId = isUserParticipant ? conversation.shopId : conversation.userId;
            io.to(recipientId.toString()).emit('chat_notification', {
                conversationId,
                text: sanitizedText.substring(0, 50) + '...',
                senderName: requestUser.fullName
            });
        } catch (error) {
            console.error('[Socket] Gửi tin nhắn real-time thất bại:', error.message);
        }

        return newMessage;
    },

    getMessages: async (conversationId, options, requestUser) => {
        // Tương tự sendMessage, kiểm tra quyền truy cập hội thoại
        const conversation = await CHAT_REPOSITORY.findConversationById(conversationId);
        if (!conversation) throw new ApiError(ERROR_CODES.NOT_FOUND);

        const isUser = conversation.userId.toString() === requestUser.userId.toString();
        const isShop = (requestUser.shopId && conversation.shopId.toString() === requestUser.shopId.toString()) || 
                      (requestUser.managedShops?.includes(conversation.shopId));

        if (!isUser && !isShop && requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
             throw new ApiError(ERROR_CODES.FORBIDDEN);
        }

        return await CHAT_REPOSITORY.paginateMessages(conversationId, options);
    },

    getUserConversations: async (userId, options) => {
        return await CHAT_REPOSITORY.paginateUserConversations(userId, options);
    },

    getShopConversations: async (shopId, options, requestUser) => {
        // Kiểm tra quyền quản lý shop
         if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
             if (requestUser.shopId?.toString() !== shopId && !requestUser.managedShops?.includes(shopId)) {
                 throw new ApiError(ERROR_CODES.FORBIDDEN);
             }
         }
        return await CHAT_REPOSITORY.paginateShopConversations(shopId, options);
    }
};
