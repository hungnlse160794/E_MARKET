import ApiError from '#utils/ApiError.js'
import { ERROR_CODES } from '../constants/errorCode.js'

export const validationHandlingMiddleware = (schema) => {
    return async (req, res, next) => {
        try {
            const validationErrors = []
            req.validated = req.validated || {}

            // Lặp qua các key có trong schema (body, params, query)
            const targets = Object.keys(schema) // ['body', 'params', 'query']

            targets.forEach((target) => {
                const { error, value } = schema[target].validate(req[target], {
                    abortEarly: false,
                    allowUnknown: false, // Không cho phép các field khác không có trong schema (tùy bạn chọn)
                    stripUnknown: true   // Tự động xóa các field thừa không khai báo trong Joi
                })

                if (error) {
                    validationErrors.push(...error.details.map(detail => detail.message))
                } else {
                    // Overwrite data "sạch" cho body/params, giữ query riêng vì một số env không cho ghi đè
                    if (target === 'query') {
                        req.validated.query = value
                    } else {
                        req[target] = value
                        req.validated[target] = value
                    }
                }
            })

            if (validationErrors.length > 0) {
                // Truyền thẳng object ERROR_CODES.VALIDATION_ERROR vào
                throw new ApiError(ERROR_CODES.VALIDATION_ERROR, validationErrors)
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}