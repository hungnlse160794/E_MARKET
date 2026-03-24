import Joi from 'joi';
import { REGEXP } from '#constants/regexp.js';

export const cartValidation = {
    addItem: {
        body: Joi.object().keys({
            productId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID sản phẩm không hợp lệ'
            }),
            shopId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID gian hàng không hợp lệ'
            }),
            branchId: Joi.string().regex(REGEXP.OBJECT_ID).messages({
                'string.pattern.base': 'ID chi nhánh không hợp lệ'
            }),
            unitName: Joi.string().required().min(1).trim().messages({
                'string.empty': 'Đơn vị tính không được để trống'
            }),
            quantity: Joi.number().integer().min(1).required().messages({
                'number.min': 'Số lượng tối thiểu là 1'
            }),
            price: Joi.number().required().min(0).messages({
                'number.min': 'Giá sản phẩm không được âm'
            })
        })
    },

    removeItem: {
        params: Joi.object().keys({
            cartId: Joi.string().regex(REGEXP.OBJECT_ID).required(),
            itemId: Joi.string().regex(REGEXP.OBJECT_ID).required()
        })
    },

    updateQuantity: {
        params: Joi.object().keys({
            cartId: Joi.string().regex(REGEXP.OBJECT_ID).required(),
            itemId: Joi.string().regex(REGEXP.OBJECT_ID).required()
        }),
        body: Joi.object().keys({
            quantity: Joi.number().integer().min(1).required().messages({
                'number.min': 'Số lượng tối thiểu là 1'
            })
        })
    },

    joinSharedCart: {
        body: Joi.object().keys({
            roomCode: Joi.string().required().trim().messages({
                'string.empty': 'Mã phòng không được để trống'
            })
        })
    }
};
