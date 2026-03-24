import { catchAsync } from '#utils/catchAsync.js';
import { blogService } from '#services/blogService.js';

export const blogController = {
    createBlog: catchAsync(async (req, res) => {
        const result = await blogService.createBlog(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'Đã tạo bài viết mới',
            data: result
        });
    }),

    getBlogBySlug: catchAsync(async (req, res) => {
        const result = await blogService.getBlogBySlug(req.params.slug);
        res.status(200).json({
            success: true,
            message: 'Lấy chi tiết bài viết thành công',
            data: result
        });
    }),

    getPlatformBlogs: catchAsync(async (req, res) => {
        const { page = 1, limit = 10, search } = req.query;
        const result = await blogService.getPlatformBlogs({ page, limit, search });
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách tin tức hệ thống thành công',
            data: result
        });
    }),

    getShopBlogs: catchAsync(async (req, res) => {
        const { shopId } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const result = await blogService.getShopBlogs(shopId, { page, limit, status });
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách tin tức gian hàng thành công',
            data: result
        });
    }),

    updateBlog: catchAsync(async (req, res) => {
        const result = await blogService.updateBlog(req.params.id, req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'Cập nhật bài viết thành công',
            data: result
        });
    }),

    deleteBlog: catchAsync(async (req, res) => {
        await blogService.deleteBlog(req.params.id, req.user);
        res.status(200).json({
            success: true,
            message: 'Đã xóa bài viết vĩnh viễn'
        });
    })
};
