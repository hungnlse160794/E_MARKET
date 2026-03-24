import { catchAsync } from '#utils/catchAsync.js';
import { categoryService } from '#services/categoryService.js';

export const categoryController = {
    createCategory: catchAsync(async (req, res) => {
        const result = await categoryService.createCategory(req.body, req.user);

        res.status(201).json({
            success: true,
            message: 'Tạo danh mục thành công',
            data: result
        });
    }),

    getCategoryById: catchAsync(async (req, res) => {
        const result = await categoryService.getCategoryById(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin danh mục thành công',
            data: result
        });
    }),

    getBranchCategories: catchAsync(async (req, res) => {
        const { branchId } = req.params;
        const result = await categoryService.getCategoriesByBranchId(branchId, req.user);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách danh mục chi nhánh thành công',
            data: result
        });
    }),

    updateCategory: catchAsync(async (req, res) => {
        const result = await categoryService.updateCategory(req.params.id, req.body, req.user);

        res.status(200).json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            data: result
        });
    }),

    deleteCategory: catchAsync(async (req, res) => {
        await categoryService.deleteCategory(req.params.id, req.user);

        res.status(200).json({
            success: true,
            message: 'Xóa danh mục thành công'
        });
    })
};
