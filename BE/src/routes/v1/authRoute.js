import express from 'express'
import { authController } from '#controllers/authController.js'
import { authHandlingMiddleware } from '#middlewares/authHandlingMiddleware.js'
import { validationHandlingMiddleware } from '#middlewares/validationHandlingMiddleware.js'
import { authRateLimiter } from '#middlewares/rateLimitHandlingMiddleware.js'
import { authValidation } from '#validations/authValidation.js'
import { sanitizeRequest } from '#middlewares/sanitizeRequestMiddleware.js'
import { GENERATE_UTILS } from '#utils/generateUtil.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64a7b9c9f1a2b3c4d5e6f7a8"
 *         email:
 *           type: string
 *           example: "chu6@gmail.com"
 *         fullName:
 *           type: string
 *           example: "Chú 6 Bún Bò"
 *         role:
 *           type: string
 *           example: "CUSTOMER"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         code:
 *           type: string
 *           example: "INVALID_CREDENTIALS"
 *         message:
 *           type: string
 *           example: "Sai email hoặc mật khẩu"
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "chu6@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "matkhau123"
 *                 minLength: 6
 *                 maxLength: 32
 *               fullName:
 *                 type: string
 *                 example: "Chú 6 Bún Bò"
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *     responses:
 *       201:
 *         description: Đăng ký tài khoản thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đăng ký tài khoản thành công"
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ (Lỗi Joi Validation hoặc Thiếu trường)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email đã tồn tại trong hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập và nhận Token (Lưu Refresh Token vào Cookie)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "chu6@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "matkhau123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công. Set-Cookie chứa refreshToken.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đăng nhập thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserResponse'
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=abcde12345; Path=/; HttpOnly; Secure; SameSite=Strict
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ (Lỗi Joi Validation)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Sai email hoặc mật khẩu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /auth/refresh-token:
 *   post:
 *     summary: Cấp lại Access Token mới bằng Refresh Token (Cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Cấp lại token thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cấp lại Access Token thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Refresh Token không hợp lệ hoặc hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /auth/logout:
 *   post:
 *     summary: Đăng xuất và xóa Refresh Token (Xóa Cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đăng xuất tài khoản thành công"
 * 
 * /auth/sessions:
 *   get:
 *     summary: Lấy danh sách các thiết bị đang đăng nhập
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thiết bị
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string, example: "64a..." }
 *                       ipAddress: { type: string, example: "127.0.0.1" }
 *                       userAgent: { type: string, example: "Mozilla..." }
 *                       createdAt: { type: string, format: date-time }
 * 
 * /auth/logout-all:
 *   post:
 *     summary: Đăng xuất khỏi tất cả các thiết bị
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 * 
 * /auth/logout-device/{sessionId}:
 *   post:
 *     summary: Đăng xuất một thiết bị cụ thể (Đăng xuất từ xa)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post(
    '/register',
    authRateLimiter,
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(authValidation.register.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(authValidation.register.body)
    ),
    validationHandlingMiddleware(authValidation.register),
    authController.register
)

router.post(
    '/login',
    sanitizeRequest(
        GENERATE_UTILS.extractFieldsFromJoi(authValidation.login.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(authValidation.login.body)
    ),
    validationHandlingMiddleware(authValidation.login),
    authController.login
)

router.post('/refresh-token', authController.refreshToken)

router.post('/logout', authController.logout)

// --- Session Management (Remote Logout) ---
router.use(authHandlingMiddleware) // Bảo vệ toàn bộ route bên dưới

router.get('/sessions', authController.getSessions)

router.post('/logout-all', authController.logoutAll)

router.post('/logout-device/:sessionId', authController.logoutDevice)

export default router