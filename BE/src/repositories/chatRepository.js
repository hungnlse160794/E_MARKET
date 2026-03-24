import { Conversation, Message } from '#models/chatModel.js';

export const CHAT_REPOSITORY = {
    // === Conversations ===
    findConversation: async (userId, shopId) => {
        return await Conversation.findOne({ userId, shopId }).lean();
    },

    createConversation: async (userId, shopId) => {
        const conversation = new Conversation({ userId, shopId });
        return await conversation.save();
    },

    paginateUserConversations: async (userId, options = {}) => {
        const { page = 1, limit = 20 } = options;
        return await Conversation.paginate(
            { userId }, 
            { page, limit, sort: { updatedAt: -1 }, populate: 'shopId' }
        );
    },

    paginateShopConversations: async (shopId, options = {}) => {
        const { page = 1, limit = 20 } = options;
        return await Conversation.paginate(
            { shopId }, 
            { page, limit, sort: { updatedAt: -1 }, populate: 'userId' }
        );
    },

    // === Messages ===
    createMessage: async (messageData) => {
        const message = new Message(messageData);
        const savedMessage = await message.save();
        
        // Cập nhật thời gian hoạt động cuối của cuộc hội thoại
        await Conversation.findByIdAndUpdate(messageData.conversationId, { updatedAt: new Date() });
        
        return savedMessage;
    },

    paginateMessages: async (conversationId, options = {}) => {
        const { page = 1, limit = 50 } = options;
        return await Message.paginate(
            { conversationId }, 
            { page, limit, sort: { createdAt: -1 } } // Tin nhắn mới nhất lên đầu
        );
    },

    findConversationById: async (id) => {
        return await Conversation.findById(id).lean();
    }
};
