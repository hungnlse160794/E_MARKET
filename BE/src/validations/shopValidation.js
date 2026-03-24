import Joi from 'joi';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { REGEXP } from '#constants/regexp.js';

export const shopValidation = {
    createShop: {
        body: Joi.object().keys({
            name: Joi.string().required().min(3).max(50).trim().messages({
                'string.empty': 'Tên gian hàng không được để trống',
                'string.min': 'Tên gian hàng phải có ít nhất {#limit} ký tự',
                'string.max': 'Tên gian hàng không được vượt quá {#limit} ký tự',
                'any.required': 'Tên gian hàng là bắt buộc'
            }),
            address: Joi.string().required().min(5).max(200).trim().messages({
                'string.empty': 'Địa chỉ không được để trống',
                'string.min': 'Địa chỉ phải có ít nhất {#limit} ký tự',
                'string.max': 'Địa chỉ không được vượt quá {#limit} ký tự',
                'any.required': 'Địa chỉ là bắt buộc'
            }),
            description: Joi.string().max(500).trim().messages({
                'string.max': 'Mô tả không được vượt quá {#limit} ký tự'
            }),
            logo: Joi.string().uri().allow('').messages({
                'string.uri': 'Đường dẫn logo phải là một URL hợp lệ'
            }),
            category: Joi.string().valid(...Object.values(COMMON_CONSTANTS.SHOP_CATEGORY)).required().messages({
                'any.only': 'Danh mục gian hàng không hợp lệ',
                'any.required': 'Danh mục gian hàng là bắt buộc'
            })
        })
    },

    getShopById: {
        params: Joi.object().keys({
            id: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID không hợp lệ'
            })
        })
    },

    verifyShop: {
        params: Joi.object().keys({
            id: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID không hợp lệ'
            })
        }),
        body: Joi.object().keys({
            status: Joi.string().valid(...Object.values(COMMON_CONSTANTS.SHOP_STATUS)).required().messages({
                'any.only': 'Trạng thái gian hàng không hợp lệ',
                'any.required': 'Trạng thái là bắt buộc'
            }),
            isVerified: Joi.boolean().messages({
                'boolean.base': 'Dữ liệu isVerified phải là kiểu boolean'
            })
        })
    },
    
    createAccount: {
        params: Joi.object().keys({
            shopId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'Shop ID không hợp lệ'
            })
        }),
        body: Joi.object().keys({
            fullName: Joi.string().required().min(3).max(50).trim().messages({
                'string.empty': 'Họ tên không được để trống',
                'string.min': 'Họ tên phải có ít nhất {#limit} ký tự',
                'string.max': 'Họ tên không được vượt quá {#limit} ký tự',
                'any.required': 'Họ tên là bắt buộc'
            }),
            email: Joi.string().required().email().lowercase().trim().messages({
                'string.empty': 'Email không được để trống',
                'string.email': 'Email không hợp lệ',
                'any.required': 'Email là bắt buộc'
            }),
            password: Joi.string().required().min(8).max(30).trim().messages({
                'string.empty': 'Mật khẩu không được để trống',
                'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
                'string.max': 'Mật khẩu không được vượt quá {#limit} ký tự',
                'any.required': 'Mật khẩu là bắt buộc'
            }),
            phone: Joi.string().regex(REGEXP.PHONE).messages({
                'string.pattern.base': 'Số điện thoại không hợp lệ'
            }),
            role: Joi.string().valid(COMMON_CONSTANTS.USER_ROLE.STAFF, COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER).required().messages({
                'any.only': 'Vai trò không hợp lệ. Chỉ chấp nhận STAFF hoặc BRANCH_MANAGER',
                'any.required': 'Vai trò là bắt buộc'
            }),
            branchId: Joi.string().regex(REGEXP.OBJECT_ID).messages({
                'string.pattern.base': 'Chi nhánh ID không hợp lệ'
            })
        })
    },
    updateAccount: {
        params: Joi.object().keys({
            shopId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'Shop ID không hợp lệ'
            }),
            userId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'User ID không hợp lệ'
            })
        }),
        body: Joi.object().keys({
            managedBranches: Joi.array().items(Joi.string().regex(REGEXP.OBJECT_ID)).required().messages({
                'array.base': 'managedBranches phải là một mảng',
                'any.required': 'Danh sách chi nhánh quản lý là bắt buộc'
            })
        })
    }
};
