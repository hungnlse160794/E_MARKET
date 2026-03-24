import { HTTP_STATUS } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';

class ApiError extends Error {
    constructor(errorData, errors = [], statusCode = null) {
        // Nếu truyền vào là 1 object từ ERROR_CODES
        if (typeof errorData === 'object' && errorData.code) {
            super(errorData.message); // Set message cho Error class
            this.code = errorData.code;
            this.statusCode = statusCode || errorData.statusCode || COMMON_CONSTANTS.DEFAULT_ERROR_STATUS;
        } else {
            // Nếu truyền vào là string code thô
            super(errorData);
            this.code = errorData;
            this.statusCode = statusCode || HTTP_STATUS[errorData] || COMMON_CONSTANTS.DEFAULT_ERROR_STATUS;
        }

        this.name = 'ApiError';
        this.errors = Array.isArray(errors) ? errors : [errors];

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;