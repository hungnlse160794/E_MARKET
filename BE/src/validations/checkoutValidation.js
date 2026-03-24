import Joi from 'joi';
import { REGEXP } from '#constants/regexp.js';
import { COMMON_CONSTANTS } from '#constants/common.js';

export const checkoutValidation = {
    checkout: {
        body: Joi.object().keys({
            cartId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID giỏ hàng không hợp lệ',
                'any.required': 'ID giỏ hàng là bắt buộc'
            }),
            paymentMethod: Joi.string().valid(
                COMMON_CONSTANTS.PAYMENT_METHOD.COD,
                COMMON_CONSTANTS.PAYMENT_METHOD.WALLET
            ).required().messages({
                'any.only': 'Phương thức thanh toán không hợp lệ (Chỉ chấp nhận COD hoặc VÍ)',
                'any.required': 'Phương thức thanh toán là bắt buộc'
            }),
            shippingAddress: Joi.object().keys({
                fullName: Joi.string().required().trim().messages({ 'any.required': 'Tên người nhận là bắt buộc' }),
                phone: Joi.string().regex(REGEXP.PHONE).required().messages({ 'string.pattern.base': 'Số điện thoại không hợp lệ' }),
                provinceId: Joi.string().required().messages({ 'any.required': 'Tỉnh/Thành phố là bắt buộc' }),
                districtId: Joi.string().required().messages({ 'any.required': 'Quận/Huyện là bắt buộc' }),
                wardCode: Joi.string().required().messages({ 'any.required': 'Phường/Xã là bắt buộc' }),
                addressLine: Joi.string().required().trim().messages({ 'any.required': 'Địa chỉ chi tiết là bắt buộc' })
            }).required(),
            vouchers: Joi.array().items(Joi.string().uppercase().trim()).default([]),
            note: Joi.string().max(500).allow('', null).messages({
                'string.max': 'Ghi chú không được vượt quá 500 ký tự'
            })
        })
    }
};
