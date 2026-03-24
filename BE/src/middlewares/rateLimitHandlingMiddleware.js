import redisClient from '#configs/redis.js';
import ApiError from '#utils/ApiError.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';

export const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000,
        max = 100,
        message = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
        keyPrefix = 'rl',
        keyGenerator = (req) => req.ip || 'unknown'
    } = options;

    return async (req, res, next) => {
        try {
            const identifier = keyGenerator(req);
            const key = `${keyPrefix}:${identifier}`;

            // Tăng số lần request trong Redis
            const currentCount = await redisClient.incr(key);

            // Nếu là request đầu tiên, set thời gian hết hạn (TTL)
            if (currentCount === 1) {
                await redisClient.pExpire(key, windowMs);
            }

            // Lấy TTL còn lại để trả về Header (tùy chọn)
            const ttl = await redisClient.pTTL(key);

            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, max - currentCount));
            res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + ttl) / 1000));

            if (currentCount > max) {
                throw new ApiError(ERROR_CODES.RATE_LIMIT_EXCEEDED, [message], 429);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Sử dụng các cấu hình cụ thể
export const authRateLimiter = createRateLimiter({
    windowMs: COMMON_CONSTANTS.RATE_LIMIT_STRICT_MS,
    max: COMMON_CONSTANTS.RATE_LIMIT_STRICT_MAX,
    keyPrefix: 'rl:auth',
    message: 'Thử đăng nhập quá nhiều lần, vui lòng đợi 15 phút.'
});

export const apiRateLimiter = createRateLimiter({
    windowMs: COMMON_CONSTANTS.RATE_LIMIT_API_MS,
    max: COMMON_CONSTANTS.RATE_LIMIT_API_MAX,
    keyPrefix: 'rl:api'
});