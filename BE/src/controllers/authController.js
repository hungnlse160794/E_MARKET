import { authService } from '#services/authService.js'
import { catchAsync } from '#utils/catchAsync.js'
import { env } from '#configs/environment.js'
import { COMMON_CONSTANTS } from '#constants/common.js'

export const authController = {
    register: catchAsync(async (req, res) => {
        const result = await authService.register(req.body)

        res.status(201).json({
            success: true,
            message: 'Đăng ký tài khoản thành công',
            data: result
        })
    }),

    login: catchAsync(async (req, res) => {
        const { email, password } = req.body

        const deviceInfo = {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        }

        const result = await authService.login(email, password, deviceInfo)

        res.cookie(COMMON_CONSTANTS.COOKIE_REFRESH_TOKEN, result.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: COMMON_CONSTANTS.COOKIE_MAX_AGE_MS
        })

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: result.user,
                accessToken: result.accessToken
            }
        })
    }),

    refreshToken: catchAsync(async (req, res) => {
        // Lấy token từ HTTP-Only Cookie (hoặc từ body nếu client không dùng cookie)
        const token = req.cookies[COMMON_CONSTANTS.COOKIE_REFRESH_TOKEN] || req.body.refreshToken

        const result = await authService.refreshToken(token)

        // Refresh Token Rotation: Cập nhật cookie với token mới
        res.cookie(COMMON_CONSTANTS.COOKIE_REFRESH_TOKEN, result.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: COMMON_CONSTANTS.COOKIE_MAX_AGE_MS
        })
        
        res.status(200).json({
            success: true,
            message: 'Cấp lại Access Token thành công',
            data: { 
                accessToken: result.accessToken,
                user: result.user
            }
        })
    }),

    logout: catchAsync(async (req, res) => {
        const refreshToken = req.cookies[COMMON_CONSTANTS.COOKIE_REFRESH_TOKEN] || req.body.refreshToken;
        const accessToken = req.headers.authorization?.split(' ')[1];
        
        await authService.logout(refreshToken, accessToken);

        // Xóa Cookie ở Browser
        res.clearCookie(COMMON_CONSTANTS.COOKIE_REFRESH_TOKEN, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict'
        })

        res.status(200).json({
            success: true,
            message: 'Đăng xuất tài khoản thành công',
            data: null
        })
    }),

    getSessions: catchAsync(async (req, res) => {
        const result = await authService.getSessions(req.user.userId)
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách thiết bị đang đăng nhập thành công',
            data: result
        })
    }),

    logoutAll: catchAsync(async (req, res) => {
        await authService.logoutAll(req.user.userId)
        
        // Xóa Cookie ở Browser
        res.clearCookie(COMMON_CONSTANTS.COOKIE_REFRESH_TOKEN, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict'
        })

        res.status(200).json({
            success: true,
            message: 'Đã đăng xuất khỏi tất cả các thiết bị',
            data: null
        })
    }),

    logoutDevice: catchAsync(async (req, res) => {
        const { sessionId } = req.params
        await authService.logoutDevice(req.user.userId, sessionId)
        
        res.status(200).json({
            success: true,
            message: 'Đã đăng xuất thiết bị thành công',
            data: null
        })
    })
}