import { catchAsync } from '#utils/catchAsync.js';
import { inventoryService } from '#services/inventoryService.js';

export const inventoryController = {
    updateStock: catchAsync(async (req, res) => {
        const result = await inventoryService.updateStock(req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'Cập nhật tồn kho thành công',
            data: result
        });
    }),

    getInventoryByBranch: catchAsync(async (req, res) => {
        const result = await inventoryService.getInventoryByBranch(req.params.branchId, req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách tồn kho thành công',
            data: result
        });
    }),

    getInventoryByShop: catchAsync(async (req, res) => {
        const result = await inventoryService.getInventoryByShop(req.params.shopId, req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách tồn kho toàn hệ thống thành công',
            data: result
        });
    }),

    getLowStockByBranch: catchAsync(async (req, res) => {
        const result = await inventoryService.getLowStockByBranch(req.params.branchId, req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách sản phẩm sắp hết kho thành công',
            data: result
        });
    }),

    getLowStockByShop: catchAsync(async (req, res) => {
        const result = await inventoryService.getLowStockByShop(req.params.shopId, req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách sản phẩm sắp hết kho toàn hệ thống thành công',
            data: result
        });
    }),

    getHistoryByBranch: catchAsync(async (req, res) => {
        const result = await inventoryService.getHistoryByBranch(req.params.branchId, req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy lịch sử tồn kho thành công',
            data: result
        });
    }),

    getHistoryByShop: catchAsync(async (req, res) => {
        const result = await inventoryService.getHistoryByShop(req.params.shopId, req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy lịch sử tồn kho toàn hệ thống thành công',
            data: result
        });
    }),

    setThreshold: catchAsync(async (req, res) => {
        const result = await inventoryService.setThreshold(req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'Thiết lập ngưỡng cảnh báo thành công',
            data: result
        });
    })
};
