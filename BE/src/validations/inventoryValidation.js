import Joi from 'joi';
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const inventoryValidation = {
    updateStock: {
        body: Joi.object().keys({
            productId: Joi.string().regex(OBJECT_ID_REGEX).required().messages({
                'string.pattern.base': 'ID sản phẩm không hợp lệ'
            }),
            branchId: Joi.string().regex(OBJECT_ID_REGEX).required().messages({
                'string.pattern.base': 'ID chi nhánh không hợp lệ'
            }),
            stockQuantity: Joi.number().integer().required().messages({
                'number.base': 'Số lượng tồn kho phải là số nguyên'
            }),
            type: Joi.string().valid('ADD', 'SUBTRACT', 'SET').default('ADD').messages({
                'any.only': 'Loại cập nhật phải là ADD, SUBTRACT hoặc SET'
            })
        })
    },

    getInventoryByBranch: {
        params: Joi.object().keys({
            branchId: Joi.string().regex(OBJECT_ID_REGEX).required()
        })
    },

    getLowStockByBranch: {
        params: Joi.object().keys({
            branchId: Joi.string().regex(OBJECT_ID_REGEX).required()
        })
    },

    getHistoryByBranch: {
        params: Joi.object().keys({
            branchId: Joi.string().regex(OBJECT_ID_REGEX).required()
        })
    },

    setThreshold: {
        body: Joi.object().keys({
            productId: Joi.string().regex(OBJECT_ID_REGEX).required(),
            branchId: Joi.string().regex(OBJECT_ID_REGEX).required(),
            lowStockThreshold: Joi.number().integer().min(0).required()
        })
    },

    getInventoryByShop: {
        params: Joi.object().keys({
            shopId: Joi.string().regex(OBJECT_ID_REGEX).required().messages({
                'string.pattern.base': 'ID cửa hàng không hợp lệ'
            })
        })
    },

    getLowStockByShop: {
        params: Joi.object().keys({
            shopId: Joi.string().regex(OBJECT_ID_REGEX).required().messages({
                'string.pattern.base': 'ID cửa hàng không hợp lệ'
            })
        })
    },

    getHistoryByShop: {
        params: Joi.object().keys({
            shopId: Joi.string().regex(OBJECT_ID_REGEX).required().messages({
                'string.pattern.base': 'ID cửa hàng không hợp lệ'
            })
        })
    }
};
