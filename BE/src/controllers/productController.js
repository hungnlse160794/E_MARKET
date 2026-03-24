import { catchAsync } from '#utils/catchAsync.js';
import { productService } from '#services/productService.js';

export const productController = {
    createProduct: catchAsync(async (req, res) => {
        const result = await productService.createProduct(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: result
        });
    }),

    getProductById: catchAsync(async (req, res) => {
        const result = await productService.getProductById(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Lấy thông tin sản phẩm thành công',
            data: result
        });
    }),

    getProductsByBranchId: catchAsync(async (req, res) => {
        const { branchId } = req.params;
        const filters = req.validated?.query || req.query;
        const result = await productService.getBranchProducts(branchId, req.pagination, filters);
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách sản phẩm thành công',
            data: result
        });
    }),

    getProducts: catchAsync(async (req, res) => {
        // Use validated query if available for correct types
        const filters = req.validated?.query || req.query;
        const result = await productService.getAllProducts(req.pagination, filters);
        res.status(200).json({
            success: true,
            message: 'Lấy toàn bộ danh sách sản phẩm thành công',
            data: result
        });
    }),

    updateProduct: catchAsync(async (req, res) => {
        const { id } = req.params;
        const result = await productService.updateProduct(id, req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: result
        });
    }),

    deleteProduct: catchAsync(async (req, res) => {
        const { id } = req.params;
        await productService.deleteProduct(id, req.user);
        res.status(200).json({
            success: true,
            message: 'Xóa sản phẩm thành công (Soft delete)'
        });
    })
};
