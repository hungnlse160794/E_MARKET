import Joi from 'joi';
import { REGEXP } from '#constants/regexp.js';

export const voucherValidation = {
    createVoucher: {
        body: Joi.object().keys({
            code: Joi.string().required().min(3).max(20).uppercase().trim().messages({
                'string.empty': 'Mã voucher không được để trống',
                'string.min': 'Mã voucher phải có ít nhất {#limit} ký tự',
                'string.max': 'Mã voucher không được vượt quá {#limit} ký tự',
                'any.required': 'Mã voucher là bắt buộc'
            }),
            shopId: Joi.string().regex(REGEXP.OBJECT_ID).allow(null).messages({
                'string.pattern.base': 'ID gian hàng không hợp lệ'
            }),
            discountType: Joi.string().valid('FIXED', 'PERCENTAGE').required().messages({
                'any.only': 'Loại giảm giá phải là FIXED hoặc PERCENTAGE',
                'any.required': 'Loại giảm giá là bắt buộc'
            }),
            discountValue: Joi.number().min(1).required().messages({
                'number.min': 'Giá trị giảm giá phải lớn hơn 0',
                'any.required': 'Giá trị giảm giá là bắt buộc'
            }),
            minOrderValue: Joi.number().min(0).default(0),
            maxDiscount: Joi.number().min(0).allow(null),
            startDate: Joi.date().greater('now').required().messages({
                'date.greater': 'Ngày bắt đầu phải sau thời điểm hiện tại',
                'any.required': 'Ngày bắt đầu là bắt buộc'
            }),
            endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
                'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu',
                'any.required': 'Ngày kết thúc là bắt buộc'
            }),
            usageLimit: Joi.number().integer().min(1).default(1).messages({
                'number.min': 'Giới hạn sử dụng phải ít nhất là 1'
            })
        })
    },

    updateVoucher: {
        params: Joi.object().keys({
            id: Joi.string().regex(REGEXP.OBJECT_ID).required()
        }),
        body: Joi.object().keys({
            discountValue: Joi.number().min(1),
            minOrderValue: Joi.number().min(0),
            maxDiscount: Joi.number().min(0),
            startDate: Joi.date(),
            endDate: Joi.date(),
            usageLimit: Joi.number().integer().min(1)
        })
    },

    applyVoucher: {
        body: Joi.object().keys({
            code: Joi.string().required().uppercase().trim(),
            shopId: Joi.string().regex(REGEXP.OBJECT_ID).allow(null), // Shop voucher hoặc Platform voucher
            totalAmount: Joi.number().required().min(0)
        })
    }
};
