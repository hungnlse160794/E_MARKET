import express from 'express';
import { blogController } from '#controllers/blogController.js';
import { blogValidation } from '#validations/blogValidation.js';
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js';
import { allowRoles, validateScope } from '#middlewares/permissionMiddleware.js';
import { validationHandlingMiddleware } from '#middlewares/validationHandlingMiddleware.js';
import { apiRateLimiter } from '#middlewares/rateLimitHandlingMiddleware.js';
import { sanitizeRequest } from '#middlewares/sanitizeRequestMiddleware.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Quản lý tin tức, bài viết Marketing cho Hệ thống & Gian hàng
 */

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Tạo bài viết mới (Quản trị viên hoặc Chủ Shop)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, contentHTML]
 *             properties:
 *               title: { type: string, example: "Hành trình khởi nghiệp" }
 *               shopId: { type: string, description: "Để trống nếu là tin tức hệ thống" }
 *               contentHTML: { type: string, example: "<h1>Hành trình!</h1>" }
 *               summary: { type: string, example: "Mô tả ngắn gọn" }
 *               thumbnail: { type: string, example: "url_image" }
 *               status: { type: string, enum: [PUBLISHED, DRAFT, HIDDEN] }
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       403:
 *         description: Không có quyền tạo tin tức hệ thống hoặc cho shop khác
 */
router.post(
    '/',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP), // Check shopId trong body nếu có
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(blogValidation.createBlog.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(blogValidation.createBlog.body)
    ),
    validationHandlingMiddleware(blogValidation.createBlog),
    blogController.createBlog
);

/**
 * @swagger
 * /blogs/p/{slug}:
 *   get:
 *     summary: Xem chi tiết bài viết qua Slug (SEO Friendly)
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
    '/p/:slug',
    blogController.getBlogBySlug
);

/**
 * @swagger
 * /blogs/platform:
 *   get:
 *     summary: Lấy danh sách tin tức từ Hệ thống
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Trả về danh sách tin tức hệ thống phân trang
 */
router.get(
    '/platform',
    blogController.getPlatformBlogs
);

/**
 * @swagger
 * /blogs/shop/{shopId}:
 *   get:
 *     summary: Lấy danh sách tin tức từ một Gian hàng
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
    '/shop/:shopId',
    blogController.getShopBlogs
);

/**
 * @swagger
 * /blogs/{id}:
 *   patch:
 *     summary: Cập nhật bài viết
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch(
    '/:id',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(blogValidation.updateBlog.body)
    ),
    validationHandlingMiddleware(blogValidation.updateBlog),
    blogController.updateBlog
);

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Xóa bài viết
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete(
    '/:id',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN),
    blogController.deleteBlog
);

export default router;
