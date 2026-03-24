import { env } from '#configs/environment.js'
// Sửa lại đường dẫn import cho đồng bộ với alias # nếu bạn đã setup trong package.json
import { ERROR_CODES } from '#constants/errorCode.js'
import ApiError from '#utils/ApiError.js'
import { COMMON_CONSTANTS } from '#constants/common.js'

/**
 * Middleware bắt lỗi 404 (Route Not Found)
 * Đặt trước errorHandlingMiddleware trong file server.js
 */
export const notFoundHandler = (req, res, next) => {
    // Ném lỗi 404 xuống cho errorHandlingMiddleware xử lý tập trung
    const error = new ApiError(
        ERROR_CODES.RESOURCE_NOT_FOUND,
        [`Đường dẫn ${req.originalUrl} với phương thức ${req.method} không tồn tại trên hệ thống.`]
    )
    next(error)
}

/**
 * Middleware xử lý lỗi tập trung toàn hệ thống (Global Error Handler)
 * Đặt ở dòng cuối cùng trong file server.js
 */
// eslint-disable-next-line no-unused-vars
export const errorHandlingMiddleware = (err, req, res, next) => {
    // 1. Xử lý lỗi CORS đặc thù
    if (err.message === COMMON_CONSTANTS.CORS_NOT_ALLOWED) {
        const forbidden = ERROR_CODES.FORBIDDEN
        return res.status(forbidden.statusCode).json({
            success: false,
            code: forbidden.code,
            message: forbidden.message,
            errors: [COMMON_CONSTANTS.CORS_FORBIDDEN_MSG]
        })
    }

    // 2. Xác định StatusCode và ErrorCode
    let statusCode = err.statusCode || ERROR_CODES.INTERNAL_SERVER_ERROR.statusCode
    let errorCode = err.code || ERROR_CODES.INTERNAL_SERVER_ERROR.code
    let errorMessage = err.message || ERROR_CODES.INTERNAL_SERVER_ERROR.message
    let errorDetails = err.errors || []

    // ⚡ Logic xử lý các lỗi đặc thù từ Mongoose/MongoDB sang Format chuẩn ⚡
    
    // A. Lỗi trùng lặp dữ liệu (Unique Index - E11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        statusCode = ERROR_CODES.INVALID_REQUEST_DATA.statusCode;
        errorCode = 'DUPLICATE_FIELD';
        
        if (field === 'email') {
            errorCode = ERROR_CODES.EMAIL_ALREADY_EXISTS.code;
            errorMessage = ERROR_CODES.EMAIL_ALREADY_EXISTS.message;
        } else if (field === 'name' || field === 'shopName') {
            errorCode = ERROR_CODES.SHOP_ALREADY_EXISTS.code;
            errorMessage = ERROR_CODES.SHOP_ALREADY_EXISTS.message;
        } else {
            errorMessage = `Trường [${field}] đã tồn tại trong hệ thống.`;
        }
    }

    // B. Lỗi không tìm thấy Document (Mongoose Cast Error - ID sai định dạng)
    if (err.name === 'CastError') {
        statusCode = ERROR_CODES.RESOURCE_NOT_FOUND.statusCode;
        errorCode = ERROR_CODES.RESOURCE_NOT_FOUND.code;
        errorMessage = `Giá trị [${err.value}] của trường [${err.path}] không đúng định dạng ID.`;
    }

    // C. Lỗi Validation từ Mongoose Model
    if (err.name === 'ValidationError') {
        statusCode = ERROR_CODES.VALIDATION_ERROR.statusCode;
        errorCode = ERROR_CODES.VALIDATION_ERROR.code;
        errorMessage = 'Dữ liệu không hợp lệ theo quy định của hệ thống.';
        errorDetails = Object.values(err.errors).map(el => el.message);
    }

    const responseError = {
        success: false,
        code: errorCode,
        message: errorMessage,
        errors: errorDetails
    }

    // 3. Log lỗi và thêm Stack Trace khi ở môi trường Development
    if (env.NODE_ENV === 'dev') {
        responseError.stack = err.stack
        // eslint-disable-next-line no-console
        console.error(`--- 💥 Error tại [${req.method}] ${req.originalUrl} ---`)
        console.error(err)
        console.error('--------------------------------------------------')
    }

    res.status(statusCode).json(responseError)
}