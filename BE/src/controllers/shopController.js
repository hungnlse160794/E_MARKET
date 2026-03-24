import { catchAsync } from '#utils/catchAsync.js';
import { shopService } from '#services/shopService.js';

export const shopController = {
    createShop: catchAsync(async (req, res) => {
        const result = await shopService.createShop(req.user.userId, req.body);

        res.status(201).json({
            success: true,
            message: 'Tạo gian hàng thành công. Chào mừng chủ cửa hàng mới!',
            data: result
        });
    }),

    getMyShop: catchAsync(async (req, res) => {
        const result = await shopService.getMyShops(req.user.userId);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách gian hàng của bạn thành công',
            data: result
        });
    }),

    getShopById: catchAsync(async (req, res) => {
        const result = await shopService.getShopById(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin gian hàng thành công',
            data: result
        });
    }),

    verifyShop: catchAsync(async (req, res) => {
        const result = await shopService.verifyShop(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái gian hàng thành công',
            data: result
        });
    }),

    createShopAccount: catchAsync(async (req, res) => {
        const result = await shopService.createShopAccount(req.params.shopId, req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'Tạo tài khoản nhân viên/quản lý thành công',
            data: result
        });
    }),

    getDashboardMetrics: catchAsync(async (req, res) => {
        const result = await shopService.getDashboardMetrics(req.user.shopId);
        res.status(200).json({
            success: true,
            message: 'Lấy chỉ số hiệu năng thành công',
            data: result
        });
    }),

    updateShopAccount: catchAsync(async (req, res) => {
        const { shopId, userId } = req.params;
        const result = await shopService.updateShopAccount(shopId, userId, req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'Cập nhật tài khoản thành công',
            data: result
        });
    }),

    updateManagedBranches: catchAsync(async (req, res) => {
        const { shopId, userId } = req.params;
        const { managedBranches } = req.body;
        const result = await shopService.updateManagedBranches(shopId, userId, managedBranches, req.user);
        res.status(200).json({
            success: true,
            message: 'Cập nhật danh sách chi nhánh quản lý thành công',
            data: result
        });
    }),

    deleteShopAccount: catchAsync(async (req, res) => {
        const { shopId, userId } = req.params;
        await shopService.deleteShopAccount(shopId, userId, req.user);
        res.status(200).json({
            success: true,
            message: 'Xóa tài khoản nhân sự thành công'
        });
    }),

    getShopAccounts: catchAsync(async (req, res) => {
        const { shopId } = req.params;
        const result = await shopService.getShopAccounts(shopId, req.query, req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách nhân sự thành công',
            data: result
        });
    }),

    getShopAccountById: catchAsync(async (req, res) => {
        const { shopId, userId } = req.params;
        const result = await shopService.getShopAccountById(shopId, userId, req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy thông tin nhân sự thành công',
            data: result
        });
    })
};
