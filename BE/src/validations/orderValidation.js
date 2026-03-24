import Joi from 'joi';
import { REGEXP } from '#constants/regexp.js';
import { COMMON_CONSTANTS } from '#constants/common.js';

export const orderValidation = {
    checkout: {
        body: Joi.object().keys({
            cartId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID giỏ hàng không hợp lệ',
                'any.required': 'Giỏ hàng thanh toán là bắt buộc'
            }),
            paymentMethod: Joi.string().valid(...Object.values(COMMON_CONSTANTS.PAYMENT_METHOD)).required().messages({
                'any.only': 'Phương thức thanh toán không hợp lệ',
                'any.required': 'Phương thức thanh toán là bắt buộc'
            }),
            shippingAddress: Joi.object().required().messages({
                'any.required': 'Địa chỉ giao hàng là bắt buộc'
            }),
            vouchers: Joi.array().items(Joi.string().uppercase()).max(10).messages({
                'array.base': 'Danh sách voucher phải là mảng chuỗi',
                'array.max': 'Bạn chỉ được áp tối đa 10 mã giảm giá'
            }),
            note: Joi.string().allow('').max(200).messages({
                'string.max': 'Ghi chú không được dài quá {#limit} ký tự'
            })
        })
    },

    updateStatus: {
        params: Joi.object().keys({
            id: Joi.string().regex(REGEXP.OBJECT_ID).required()
        }),
        body: Joi.object().keys({
            status: Joi.string().valid(...Object.values(COMMON_CONSTANTS.ORDER_STATUS)).required().messages({
                'any.only': 'Trạng thái đơn hàng không hợp lệ',
                'any.required': 'Trạng thái đơn hàng là bắt buộc'
            })
        })
    },

    getOrderById: {
        params: Joi.object().keys({
            id: Joi.string().regex(REGEXP.OBJECT_ID).required()
        })
    }
};
