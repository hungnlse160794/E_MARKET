import cron from 'node-cron';
import { SharedCart } from '#models/cartModel.js';
import { AuditLog } from '#models/auditLogModel.js';
import { RefreshToken } from '#models/refreshTokenModel.js';

/**
 * ⚡ Hệ thống Tự động Dọn dẹp (Cleanup Jobs) ⚡
 * Chạy định kỳ để tối ưu hóa hiệu năng DB và hạ tầng
 */
export const initCleanupJobs = () => {
    // 1. Dọn dẹp Giỏ hàng bị bỏ rơi (Abandoned Carts) sau 30 ngày
    // Chạy vào lúc 01:00 mỗi ngày
    cron.schedule('0 1 * * *', async () => {
        console.log('[Job] Đang dọn dẹp giỏ hàng cũ...');
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const result = await SharedCart.deleteMany({
            status: 'ACTIVE',
            updatedAt: { $lt: thirtyDaysAgo }
        });
        console.log(`[Job] Đã xóa ${result.deletedCount} giỏ hàng cũ.`);
    });

    // 2. Dọn dẹp Audit Log cũ (Giữ lại 8 ngày theo config)
    // Chạy vào lúc 02:00 mỗi ngày
    cron.schedule('0 2 * * *', async () => {
        console.log('[Job] Đang dọn dẹp Audit Logs...');
        const retentionLimit = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
        const result = await AuditLog.deleteMany({
            createdAt: { $lt: retentionLimit }
        });
        console.log(`[Job] Đã xóa ${result.deletedCount} audit logs cũ.`);
    });

    // 3. Dọn dẹp Refresh Tokens hết hạn
    // Chạy vào lúc 03:00 mỗi ngày
    cron.schedule('0 3 * * *', async () => {
        console.log('[Job] Đang dọn dẹp Refresh Tokens hết hạn...');
        const result = await RefreshToken.deleteMany({
            $or: [
                { expiresAt: { $lt: new Date() } },
                { isRevoked: true }
            ]
        });
        console.log(`[Job] Đã xóa ${result.deletedCount} sessions hết hạn.`);
    });

    // 4. Tự động hủy đơn hàng quá hạn thanh toán (20 phút)
    // Chạy mỗi 15 phút
    cron.schedule('*/15 * * * *', async () => {
        console.log('[Job] Đang kiểm tra đơn hàng quá hạn thanh toán...');
        try {
            const { orderService } = await import('#services/orderService.js');
            await orderService.cancelExpiredOrders(20);
        } catch (error) {
            console.error('[Job] Lỗi trong tiến trình dọn dẹp đơn hàng:', error);
        }
    });
};
