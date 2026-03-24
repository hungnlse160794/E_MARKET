import { catchAsync } from '#utils/catchAsync.js';
import { branchService } from '#services/branchService.js';

export const branchController = {
    createBranch: catchAsync(async (req, res) => {
        const result = await branchService.createBranch(req.body, req.user);

        res.status(201).json({
            success: true,
            message: 'Tạo chi nhánh thành công',
            data: result
        });
    }),

    getBranchById: catchAsync(async (req, res) => {
        const result = await branchService.getBranchById(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin chi nhánh thành công',
            data: result
        });
    }),

    getBranchesByShopId: catchAsync(async (req, res) => {
        const result = await branchService.getBranchesByShopId(req.params.shopId);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách chi nhánh thành công',
            data: result
        });
    }),

    getNearbyBranches: catchAsync(async (req, res) => {
        const { longitude, latitude, maxDistance } = req.query;
        const result = await branchService.getNearbyBranches(
            parseFloat(longitude),
            parseFloat(latitude),
            maxDistance ? parseInt(maxDistance, 10) : undefined
        );

        res.status(200).json({
            success: true,
            message: 'Tìm chi nhánh gần nhất thành công',
            data: result
        });
    }),

    updateBranch: catchAsync(async (req, res) => {
        const result = await branchService.updateBranch(req.params.id, req.body, req.user);

        res.status(200).json({
            success: true,
            message: 'Cập nhật chi nhánh thành công',
            data: result
        });
    }),

    deleteBranch: catchAsync(async (req, res) => {
        await branchService.deleteBranch(req.params.id, req.user);

        res.status(200).json({
            success: true,
            message: 'Xóa chi nhánh thành công'
        });
    })
};
