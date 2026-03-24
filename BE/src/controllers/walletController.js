import { catchAsync } from '#utils/catchAsync.js';
import { walletService } from '#services/walletService.js';

export const walletController = {
    getWalletByShop: catchAsync(async (req, res) => {
        const result = await walletService.getWalletByShop(req.params.shopId, req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy thông tin ví thành công',
            data: result
        });
    }),

    /**
     * Endpoint giả lập thanh toán hoàn tất (Cho Demo/Testing)
     * Thường gọi từ Webhook Payment hoặc Cronjob
     */
    completeSubOrder: catchAsync(async (req, res) => {
        await walletService.completeSubOrderPayment(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Đơn hàng đã được quyết toán vào ví Shop'
        });
    }),

    /**
     * Khách hàng / Shop Owner yêu cầu rút tiền
     */
    requestWithdrawal: catchAsync(async (req, res) => {
        const { shopId } = req.params;
        const { amount } = req.body;
        const result = await walletService.requestWithdrawal(shopId, amount, req.user);
        res.status(200).json({
            success: true,
            message: 'Yêu cầu rút tiền đã được gửi. Chờ admin duyệt.',
            data: result
        });
    }),

    /**
     * Admin duyệt rút tiền
     */
    reviewWithdrawal: catchAsync(async (req, res) => {
        const { txnId } = req.params;
        const { action } = req.body; // 'APPROVE' hoặc 'REJECT'
        const result = await walletService.reviewWithdrawal(txnId, action, req.user);
        res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    })
};
