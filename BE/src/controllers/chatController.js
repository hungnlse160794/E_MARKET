import { catchAsync } from '#utils/catchAsync.js';
import { chatService } from '#services/chatService.js';

export const chatController = {
    /**
     * Khởi tạo hoặc tìm lại cuộc hội thoại giữa User và Shop
     */
    getOrCreateConversation: catchAsync(async (req, res) => {
        const { shopId } = req.body;
        const result = await chatService.getOrCreateConversation(req.user.userId, shopId);
        res.status(200).json({
            success: true,
            message: 'Khởi tạo hội thoại thành công',
            data: result
        });
    }),

    /**
     * Gửi tin nhắn mới
     */
    sendMessage: catchAsync(async (req, res) => {
        const result = await chatService.sendMessage(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'Đã gửi tin nhắn',
            data: result
        });
    }),

    /**
     * Lấy lịch sử tin nhắn của cuộc hội thoại (phân trang)
     */
    getMessages: catchAsync(async (req, res) => {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const result = await chatService.getMessages(conversationId, { page, limit }, req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy lịch sử tin nhắn thành công',
            data: result
        });
    }),

    /**
     * Lấy danh sách các cuộc hội thoại của User (dành cho Khách hàng)
     */
    getUserConversations: catchAsync(async (req, res) => {
        const { page = 1, limit = 20 } = req.query;
        const result = await chatService.getUserConversations(req.user.userId, { page, limit });
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách hội thoại khách hàng thành công',
            data: result
        });
    }),

    /**
     * Lấy danh sách các cuộc hội thoại của Shop (dành cho Shop Owner)
     */
    getShopConversations: catchAsync(async (req, res) => {
        const { shopId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const result = await chatService.getShopConversations(shopId, { page, limit }, req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách hội thoại gian hàng thành công',
            data: result
        });
    })
};
