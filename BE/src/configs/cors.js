import { env } from './environment.js'
import ApiError from '#utils/ApiError.js'
import { ERROR_CODES } from '#constants/errorCode.js'

// Danh sách các domain được phép gọi API (Whitelist)
const WHITELIST_DOMAINS = [
    env.CLIENT_URL
]

export const corsOptions = {
    origin: function (origin, callback) {
        // Cho phép postman hoặc server-to-server call (origin là undefined)
        if (!origin || WHITELIST_DOMAINS.includes(origin)) {
            return callback(null, true)
        }

        // Nếu domain không nằm trong Whitelist thì chặn ngay
        return callback(new ApiError(ERROR_CODES.FORBIDDEN, ['Not allowed by CORS']))
    },
    credentials: true, // Cho phép đính kèm Cookie (quan trọng cho Refresh Token)
    optionsSuccessStatus: 200
}