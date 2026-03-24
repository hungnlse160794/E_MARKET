import express from 'express';

import { productController } from '#controllers/productController.js';
import { productValidation } from '#validations/productValidation.js';
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js';
import { allowRoles, validateScope } from '#middlewares/permissionMiddleware.js';
import { validationHandlingMiddleware } from '#middlewares/validationHandlingMiddleware.js';
import { sanitizeRequest } from '#middlewares/sanitizeRequestMiddleware.js';
import { apiRateLimiter } from '#middlewares/rateLimitHandlingMiddleware.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';
import { paginationMiddleware } from '#middlewares/paginationMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Quản lý Sản phẩm theo từng Shop
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lấy toàn bộ sản phẩm của hệ thống (Cho khách hàng - Phân trang)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Tìm kiếm theo tên sản phẩm
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Lọc theo Category ID
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [price-asc, price-desc, rating-desc, newest] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm thành công
 */
router.get(
    '/',
    paginationMiddleware,
    validationHandlingMiddleware(productValidation.getProducts),
    productController.getProducts
);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Tạo sản phẩm mới
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shopId, categoryId, name, units]
 *             properties:
 *               shopId: { type: string, example: "64a7b9c9f1a2b3c4d5e6f7a8" }
 *               categoryId: { type: string, example: "64a7b9c9f1a2b3c4d5e6f7a9" }
 *               name: { type: string, example: "Trà sữa chân trâu" }
 *               description: { type: string, example: "Trà sữa nhà làm" }
 *               units: 
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     unitName: { type: string, example: "Ly Lớn" }
 *                     price: { type: number, example: 50000 }
 *                     isDefault: { type: boolean, example: true }
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post(
    '/',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH),
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(productValidation.createProduct.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(productValidation.createProduct.body)
    ),
    validationHandlingMiddleware(productValidation.createProduct),
    productController.createProduct
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Lấy chi tiết sản phẩm theo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thông tin sản phẩm
 */
router.get(
    '/:id',
    validationHandlingMiddleware(productValidation.getProductByIdOrSlug),
    productController.getProductById
);

/**
 * @swagger
 * /products/branch/{branchId}:
 *   get:
 *     summary: Lấy toàn bộ sản phẩm của một chi nhánh (Phân trang)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 */
router.get(
    '/branch/:branchId',
    paginationMiddleware,
    validationHandlingMiddleware(productValidation.getProductsByBranchId),
    productController.getProductsByBranchId
);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Cập nhật thông tin sản phẩm
 *     tags: [Products]
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
 *               status: { type: string, enum: [AVAILABLE, OUT_OF_STOCK, HIDDEN] }
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
        GENERATE_UTILS.extractFieldsFromJoi(productValidation.updateProduct.body),
        []
    ),
    validationHandlingMiddleware(productValidation.updateProduct),
    productController.updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags: [Products]
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
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.BRANCH),
    validationHandlingMiddleware(productValidation.getProductById), // Dùng chung param :id validation
    productController.deleteProduct
);

export default router;
