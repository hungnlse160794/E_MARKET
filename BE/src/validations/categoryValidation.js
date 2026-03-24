import Joi from 'joi';

import { COMMON_CONSTANTS } from '#constants/common.js';
import { REGEXP } from '#constants/regexp.js';

export const categoryValidation = {
    createCategory: {
        body: Joi.object().keys({
            name: Joi.string().required().min(2).max(50).trim().messages({
                'string.empty': 'Tên danh mục không được để trống',
                'string.min': 'Tên danh mục phải có ít nhất 2 ký tự',
                'string.max': 'Tên danh mục tối đa 50 ký tự',
                'any.required': 'Tên danh mục là bắt buộc'
            }),
            parentId: Joi.string().allow(null, '').regex(REGEXP.OBJECT_ID).messages({
                'string.pattern.base': 'ID danh mục cha không hợp lệ'
            }),
            shopId: Joi.string().required().regex(REGEXP.OBJECT_ID).messages({
                'string.pattern.base': 'ID gian hàng không hợp lệ',
                'any.required': 'ID gian hàng là bắt buộc'
            }),
            branchId: Joi.string().required().regex(REGEXP.OBJECT_ID).messages({
                'string.pattern.base': 'ID chi nhánh không hợp lệ',
                'any.required': 'ID chi nhánh là bắt buộc'
            }),
            image: Joi.string().allow('', null),
            order: Joi.number().integer().min(0).default(0),
            status: Joi.string()
                .valid(...Object.values(COMMON_CONSTANTS.CATEGORY_STATUS))
                .default(COMMON_CONSTANTS.CATEGORY_STATUS.ACTIVE)
        })
    },

    updateCategory: {
        params: Joi.object().keys({
            id: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID danh mục không hợp lệ'
            })
        }),
        body: Joi.object().keys({
            name: Joi.string().min(2).max(50).trim().messages({
                'string.empty': 'Tên danh mục không được để trống',
                'string.min': 'Tên danh mục phải có ít nhất {#limit} ký tự',
                'string.max': 'Tên danh mục không được vượt quá {#limit} ký tự'
            }),
            image: Joi.string().uri().allow('').messages({
                'string.uri': 'Đường dẫn ảnh phải là một URL hợp lệ'
            }),
            order: Joi.number().integer().min(0).messages({
                'number.base': 'Thứ tự hiển thị phải là số',
                'number.integer': 'Thứ tự hiển thị phải là số nguyên',
                'number.min': 'Thứ tự hiển thị không được âm'
            }),
            status: Joi.string().valid(...Object.values(COMMON_CONSTANTS.CATEGORY_STATUS)).messages({
                'any.only': 'Trạng thái danh mục không hợp lệ'
            }),
            parentId: Joi.string().allow(null, '').regex(REGEXP.OBJECT_ID).messages({
                'string.pattern.base': 'ID danh mục cha không hợp lệ'
            })
        })
    },

    getCategoryById: {
        params: Joi.object().keys({
            id: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID danh mục không hợp lệ'
            })
        })
    },

    getCategoriesByBranchId: {
        params: Joi.object().keys({
            branchId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID chi nhánh không hợp lệ'
            })
        })
    }
};
