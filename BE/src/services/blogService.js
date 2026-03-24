import { BLOG_REPOSITORY } from '#repositories/blogRepository.js';
import { SHOP_REPOSITORY } from '#repositories/shopRepository.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';
import { PERMISSION_UTIL } from '#utils/permissionUtil.js';
import ApiError from '#utils/ApiError.js';
import { sanitizeHtml } from '#utils/sanitizeHtmlUtil.js';

export const blogService = {
    createBlog: async (blogData, requestUser) => {
        const { title, shopId, contentHTML } = blogData;

        // REFACTORED: Sử dụng PERMISSION_UTIL cho cả 2 luồng Shop vs Admin
        if (shopId) {
            const shop = await SHOP_REPOSITORY.findById(shopId);
            if (!shop) throw new ApiError(ERROR_CODES.SHOP_NOT_FOUND);
            PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);
        } else {
            // Không có shopId -> Blog Sàn -> Chỉ ADMIN được tạo
            if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
                throw new ApiError(ERROR_CODES.FORBIDDEN, ['Chỉ quản trị viên mới được tạo tin tức hệ thống']);
            }
        }

        const slug = GENERATE_UTILS.generateSlug(title) + '-' + Date.now().toString().slice(-4);
        const sanitizedContent = sanitizeHtml(contentHTML);

        return await BLOG_REPOSITORY.create({
            ...blogData,
            slug,
            contentHTML: sanitizedContent,
            authorId: requestUser.userId
        });
    },

    getBlogBySlug: async (slug) => {
        const blog = await BLOG_REPOSITORY.findBySlug(slug);
        if (!blog) throw new ApiError(ERROR_CODES.NOT_FOUND, ['Bài viết không tồn tại']);
        
        await BLOG_REPOSITORY.incrementView(blog._id);
        return blog;
    },

    getPlatformBlogs: async (options) => {
        return await BLOG_REPOSITORY.paginatePlatform(options);
    },

    getShopBlogs: async (shopId, options) => {
        return await BLOG_REPOSITORY.paginateShop(shopId, options);
    },

    updateBlog: async (blogId, updateData, requestUser) => {
        const blog = await BLOG_REPOSITORY.findById(blogId);
        if (!blog) throw new ApiError(ERROR_CODES.NOT_FOUND);

        // REFACTORED: Kiểm tra quyền sở hữu bài viết hoặc ADMIN
        PERMISSION_UTIL.verifyAuthor(blog.authorId._id || blog.authorId, requestUser);

        if (updateData.contentHTML) {
            updateData.contentHTML = sanitizeHtml(updateData.contentHTML);
        }

        return await BLOG_REPOSITORY.updateById(blogId, updateData);
    },

    deleteBlog: async (blogId, requestUser) => {
        const blog = await BLOG_REPOSITORY.findById(blogId);
        if (!blog) throw new ApiError(ERROR_CODES.NOT_FOUND);

        PERMISSION_UTIL.verifyAuthor(blog.authorId._id || blog.authorId, requestUser);

        return await BLOG_REPOSITORY.deleteById(blogId);
    }
};
