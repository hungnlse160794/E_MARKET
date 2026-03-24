import express from 'express';

import { categoryController } from '#controllers/categoryController.js';
import { categoryValidation } from '#validations/categoryValidation.js';
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js';
import { allowRoles, validateScope } from '#middlewares/permissionMiddleware.js';
import { validationHandlingMiddleware } from '#middlewares/validationHandlingMiddleware.js';
import { sanitizeRequest } from '#middlewares/sanitizeRequestMiddleware.js';
import { apiRateLimiter } from '#middlewares/rateLimitHandlingMiddleware.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Quản lý Danh mục sản phẩm (Sàn & Shop)
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Tạo danh mục mới (Admin tạo danh mục sàn, Shop Owner tạo danh mục shop)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Đồ uống" }
 *               parentId: { type: string, example: "64a7b9c9f1a2b3c4d5e6f7a8" }
 *               shopId: { type: string, example: "64a7b9c9f1a2b3c4d5e6f7a9", description: "Null = danh mục sàn" }
 *               image: { type: string, example: "https://example.com/image.jpg" }
 *               order: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Tạo danh mục thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền
 */
router.post(
    '/',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH),
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(categoryValidation.createCategory.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(categoryValidation.createCategory.body)
    ),
    validationHandlingMiddleware(categoryValidation.createCategory),
    categoryController.createCategory
);

/**
 * @swagger
 * /categories/branch/{branchId}:
 *   get:
 *     summary: Lấy danh sách danh mục theo Chi nhánh
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Danh sách danh mục chi nhánh
 */
router.get(
    '/branch/:branchId',
    authHandlingMiddleware, // Thêm auth để check branch ownership
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH),
    validationHandlingMiddleware(categoryValidation.getCategoriesByBranchId),
    categoryController.getBranchCategories
);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Lấy chi tiết danh mục theo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thông tin danh mục
 */
router.get(
    '/:id',
    validationHandlingMiddleware(categoryValidation.getCategoryById),
    categoryController.getCategoryById
);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Cập nhật danh mục
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               image: { type: string }
 *               order: { type: integer }
 *               status: { type: string, enum: [ACTIVE, HIDDEN] }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch(
    '/:id',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH),
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(categoryValidation.updateCategory.body),
        []
    ),
    validationHandlingMiddleware(categoryValidation.updateCategory),
    categoryController.updateCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Xóa danh mục (chặn nếu còn sản phẩm hoặc danh mục con)
 *     tags: [Categories]
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
 *       400:
 *         description: Không thể xóa (còn danh mục con hoặc sản phẩm)
 */
router.delete(
    '/:id',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH),
    validationHandlingMiddleware(categoryValidation.getCategoryById),
    categoryController.deleteCategory
);

export default router;
