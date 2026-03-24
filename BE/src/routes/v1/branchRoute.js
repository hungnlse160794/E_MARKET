import express from 'express';

import { branchController } from '#controllers/branchController.js';
import { branchValidation } from '#validations/branchValidation.js';
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
 *   name: Branches
 *   description: Quản lý Chi nhánh (Branch) theo Shop
 */

/**
 * @swagger
 * /branches:
 *   post:
 *     summary: Tạo chi nhánh mới cho Shop
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shopId, branchName, address]
 *             properties:
 *               shopId: { type: string, example: "64a7b9c9f1a2b3c4d5e6f7a8" }
 *               branchName: { type: string, example: "Chi nhánh Dĩ An" }
 *               address:
 *                 type: object
 *                 properties:
 *                   province: { type: string, example: "Bình Dương" }
 *                   district: { type: string, example: "Dĩ An" }
 *                   ward: { type: string, example: "Đông Hòa" }
 *                   street: { type: string, example: "123 Đường ABC" }
 *                   fullAddress: { type: string, example: "123 Đường ABC, Đông Hòa, Dĩ An, Bình Dương" }
 *               location:
 *                 type: object
 *                 properties:
 *                   type: { type: string, example: "Point" }
 *                   coordinates: { type: array, items: { type: number }, example: [106.6557, 10.8934] }
 *               contactPhone: { type: string, example: "0987654321" }
 *               workingHours:
 *                 type: object
 *                 properties:
 *                   open: { type: string, example: "08:00" }
 *                   close: { type: string, example: "22:00" }
 *     responses:
 *       201:
 *         description: Tạo chi nhánh thành công
 */
router.post(
    '/',
    authHandlingMiddleware,
    apiRateLimiter,
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER),
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP),
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(branchValidation.createBranch.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(branchValidation.createBranch.body)
    ),
    validationHandlingMiddleware(branchValidation.createBranch),
    branchController.createBranch
);

/**
 * @swagger
 * /branches/nearby:
 *   get:
 *     summary: Tìm chi nhánh gần nhất (theo toạ độ GPS)
 *     tags: [Branches]
 *     parameters:
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema: { type: number, example: 106.6557 }
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema: { type: number, example: 10.8934 }
 *       - in: query
 *         name: maxDistance
 *         schema: { type: integer, default: 5000, description: "Bán kính tìm kiếm (mét)" }
 *     responses:
 *       200:
 *         description: Danh sách chi nhánh gần nhất
 */
router.get(
    '/nearby',
    branchController.getNearbyBranches
);

/**
 * @swagger
 * /branches/shop/{shopId}:
 *   get:
 *     summary: Lấy danh sách chi nhánh theo Shop
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Danh sách chi nhánh
 */
router.get(
    '/shop/:shopId',
    validationHandlingMiddleware(branchValidation.getBranchesByShopId),
    branchController.getBranchesByShopId
);

/**
 * @swagger
 * /branches/{id}:
 *   get:
 *     summary: Lấy chi tiết chi nhánh theo ID
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thông tin chi nhánh
 */
router.get(
    '/:id',
    validationHandlingMiddleware(branchValidation.getBranchById),
    branchController.getBranchById
);

/**
 * @swagger
 * /branches/{id}:
 *   patch:
 *     summary: Cập nhật chi nhánh (SHOP_OWNER hoặc BRANCH_MANAGER)
 *     tags: [Branches]
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
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER, COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER),
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(branchValidation.updateBranch.body),
        []
    ),
    validationHandlingMiddleware(branchValidation.updateBranch),
    branchController.updateBranch
);

/**
 * @swagger
 * /branches/{id}:
 *   delete:
 *     summary: Xóa chi nhánh (chỉ SHOP_OWNER)
 *     tags: [Branches]
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
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER),
    validationHandlingMiddleware(branchValidation.getBranchById),
    branchController.deleteBranch
);

export default router;
