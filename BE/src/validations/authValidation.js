import Joi from 'joi'
import { REGEXP } from '#constants/regexp.js'

export const authValidation = {
    register: {
        body: Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': 'Email không đúng định dạng',
                'any.required': 'Email là bắt buộc'
            }),
            password: Joi.string()
                .pattern(REGEXP.PASSWORD)
                .required()
                .messages({
                    'string.pattern.base': 'Mật khẩu phải từ 8-32 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số',
                    'any.required': 'Mật khẩu là bắt buộc'
                }),
            fullName: Joi.string().min(2).max(50).required().messages({
                'any.required': 'Họ tên là bắt buộc'
            }),
            phone: Joi.string().pattern(REGEXP.PHONE).optional().messages({
                'string.pattern.base': 'Số điện thoại không hợp lệ'
            })
        }).strict()
    },

    login: {
        body: Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': 'Email không đúng định dạng',
                'any.required': 'Email là bắt buộc'
            }),
            password: Joi.string().required().messages({
                'any.required': 'Mật khẩu là bắt buộc'
            })
        }).strict()
    }
}