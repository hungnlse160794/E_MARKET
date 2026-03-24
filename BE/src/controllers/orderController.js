import { catchAsync } from '#utils/catchAsync.js';
import { orderService } from '#services/orderService.js';

export const orderController = {
    checkout: catchAsync(async (req, res) => {
        const result = await orderService.checkout(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công, vui lòng chờ giao hàng',
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
        // Logic sẽ được bổ sung sau hoặc dùng ORDER_REPOSITORY trực tiếp nếu đơn giản
        // Ở đây demo chốt ParentOrder list cho Customer
        res.status(200).json({
            success: true,
            data: { orders: [], pagination: { total: 0, page, limit } }
        });
    })
};
