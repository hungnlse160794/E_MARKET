import jwt from 'jsonwebtoken'
import ApiError from '#utils/ApiError.js'
import { ERROR_CODES } from '#constants/errorCode.js'
import { catchAsync } from '#utils/catchAsync.js'
import { env } from '#configs/environment.js'
import redisClient from '#configs/redis.js';

export const authHandlingMiddleware = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(ERROR_CODES.UNAUTHORIZED, ['Không tìm thấy token xác thực'], 401)
    }

    const token = authHeader.split(' ')[1]

    try {
        // ⚡ Token Blacklisting ⚡: Kiểm tra xem token này đã bị vô hiệu hóa chưa
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) throw new ApiError(ERROR_CODES.UNAUTHORIZED, ['Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại']);

        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)

        req.user = {
            userId: decoded.userId,
            _id: decoded.userId, // Alias cho tính tương thích repository
            role: decoded.role,
            shopId: decoded.shopId || null,
            branchId: decoded.branchId || null,
            managedBranches: decoded.managedBranches || []
        }

        next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new ApiError(ERROR_CODES.UNAUTHORIZED, [error.message]))
        } else if (error.name === 'TokenExpiredError') {
            next(new ApiError(ERROR_CODES.TOKEN_EXPIRED, [error.message]))
        } else {
            next(error)
        }
    }
})