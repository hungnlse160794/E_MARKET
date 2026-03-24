import { catchAsync } from '#utils/catchAsync.js';
import { orderService } from '#services/orderService.js';

export const orderController = {
    checkout: catchAsync(async (req, res) => {
        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const result = await orderService.checkout(req.body, req.user, ipAddr);
        res.status(201).json({
            success: true,
            message: result.paymentUrl ? 'Chuyển hướng đến cổng thanh toán VNPay' : 'Đặt hàng thành công, vui lòng chờ giao hàng',
            data: result
        });
    }),

    getParentOrderById: catchAsync(async (req, res) => {
        const result = await orderService.getParentOrderById(req.params.id, req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy thông tin đơn hàng thành công',
            data: result
        });
    }),

    updateSubOrderStatus: catchAsync(async (req, res) => {
        const result = await orderService.updateSubOrderStatus(req.params.id, req.body.status, req.user);
        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công',
            data: result
        });
    }),

    // Cho Khách hàng xem lịch sử đơn hàng
    getMyOrders: catchAsync(async (req, res) => {
        const { page = 1, limit = 10 } = req.query;
        res.status(200).json({
            success: true,
            data: { orders: [], pagination: { total: 0, page, limit } }
        });
    }),

    // VNPay Return (FE Redirect)
    vnpayReturn: catchAsync(async (req, res) => {
        const result = await orderService.handleVNPayReturn(req.query);
        // Redirect về FE với thông tin kết quả
        const redirectUrl = `${process.env.CLIENT_URL}/order/vnpay-result?success=${result.success}&orderId=${result.orderId}`;
        res.redirect(redirectUrl);
    }),

    // VNPay IPN (Server-to-Server Webhook)
    vnpayIpn: catchAsync(async (req, res) => {
        const result = await orderService.handleVNPayIPN(req.query);
        res.status(200).json(result);
    })
};
