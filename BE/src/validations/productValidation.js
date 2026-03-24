import Joi from 'joi';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { REGEXP } from '#constants/regexp.js';

export const productValidation = {
    createProduct: {
        body: Joi.object().keys({
            shopId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'Shop ID không hợp lệ',
                'any.required': 'Shop ID là bắt buộc'
            }),
            branchId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'Branch ID không hợp lệ',
                'any.required': 'Branch ID là bắt buộc'
            }),
            categoryId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'Category ID không hợp lệ',
                'any.required': 'Category ID là bắt buộc'
            }),
            name: Joi.string().required().min(3).max(100).trim().messages({
                'string.empty': 'Tên sản phẩm không được để trống',
                'string.min': 'Tên sản phẩm phải có ít nhất {#limit} ký tự',
                'string.max': 'Tên sản phẩm không được vượt quá {#limit} ký tự',
                'any.required': 'Tên sản phẩm là bắt buộc'
            }),
            description: Joi.string().max(1000).allow('', null).trim().messages({
                'string.max': 'Mô tả không được vượt quá {#limit} ký tự'
            }),
            images: Joi.array().items(Joi.string().uri().messages({
                'string.uri': 'Đường dẫn hình ảnh phải là một URL hợp lệ'
            })).max(5).messages({
                'array.max': 'Chỉ được phép tải lên tối đa {#limit} hình ảnh'
            }),
            units: Joi.array().items(
                Joi.object().keys({
                    unitName: Joi.string().required().messages({
                        'string.empty': 'Tên đơn vị tính không được để trống',
                        'any.required': 'Tên đơn vị tính là bắt buộc'
                    }),
                    price: Joi.number().min(0).required().messages({
                        'number.base': 'Giá bán phải là số',
                        'number.min': 'Giá bán không được âm',
                        'any.required': 'Giá bán là bắt buộc'
                    }),
                    isDefault: Joi.boolean().default(false).messages({
                        'boolean.base': 'isDefault phải là kiểu boolean'
                    })
                })
            ).min(1).required().messages({
                'array.min': 'Sản phẩm phải có ít nhất 1 đơn vị tính (unit)',
                'any.required': 'Đơn vị tính là bắt buộc'
            }),
            options: Joi.array().items(
                Joi.object().keys({
                    name: Joi.string().required().messages({
                        'string.empty': 'Tên tuỳ chọn không được để trống',
                        'any.required': 'Tên tuỳ chọn là bắt buộc'
                    }),
                    price: Joi.number().min(0).required().messages({
                        'number.base': 'Giá tuỳ chọn phải là số',
                        'number.min': 'Giá tuỳ chọn không được âm',
                        'any.required': 'Giá tuỳ chọn là bắt buộc'
                    })
                })
            ).messages({
                'array.base': 'Tuỳ chọn phải là một danh sách (mảng)'
            }),
            status: Joi.string().valid(...Object.values(COMMON_CONSTANTS.PRODUCT_STATUS)).default(COMMON_CONSTANTS.PRODUCT_STATUS.AVAILABLE).messages({
                'any.only': 'Trạng thái sản phẩm không hợp lệ'
            }),
            tags: Joi.array().items(Joi.string().trim()).messages({
                'array.base': 'Tags phải là một mảng string'
            })

        })
    },

    updateProduct: {
        params: Joi.object().keys({
            id: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID không hợp lệ',
                'any.required': 'ID sản phẩm là bắt buộc'
            })
        }),
        body: Joi.object().keys({
            categoryId: Joi.string().regex(REGEXP.OBJECT_ID).messages({
                'string.pattern.base': 'Category ID không hợp lệ'
            }),
            name: Joi.string().min(3).max(100).trim().messages({
                'string.empty': 'Tên sản phẩm không được để trống',
                'string.min': 'Tên sản phẩm phải có ít nhất {#limit} ký tự',
                'string.max': 'Tên sản phẩm không được vượt quá {#limit} ký tự'
            }),
            description: Joi.string().max(1000).allow('', null).trim().messages({
                'string.max': 'Mô tả không được vượt quá {#limit} ký tự'
            }),
            images: Joi.array().items(Joi.string().uri().messages({
                'string.uri': 'Đường dẫn hình ảnh phải là URL hợp lệ'
            })).max(5).messages({
                'array.max': 'Chỉ được phép có tối đa {#limit} hình ảnh'
            }),
            units: Joi.array().items(
                Joi.object().keys({
                    unitName: Joi.string().required().messages({
                        'string.empty': 'Tên đơn vị tính không được để trống',
                        'any.required': 'Tên đơn vị tính là bắt buộc'
                    }),
                    price: Joi.number().min(0).required().messages({
                        'number.base': 'Giá bán phải là số',
                        'number.min': 'Giá bán không được âm',
                        'any.required': 'Giá bán là bắt buộc'
                    }),
                    isDefault: Joi.boolean().default(false).messages({
                        'boolean.base': 'isDefault phải là kiểu boolean'
                    })
                })
            ).messages({
                'array.base': 'Đơn vị tính phải là một mảng'
            }),
            options: Joi.array().items(
                Joi.object().keys({
                    name: Joi.string().required().messages({
                        'string.empty': 'Tên tuỳ chọn không được để trống',
                        'any.required': 'Tên tuỳ chọn là bắt buộc'
                    }),
                    price: Joi.number().min(0).required().messages({
                        'number.base': 'Giá tuỳ chọn phải là số',
                        'number.min': 'Giá tuỳ chọn không âm',
                        'any.required': 'Giá tuỳ chọn là bắt buộc'
                    })
                })
            ).messages({
                'array.base': 'Tuỳ chọn phải là một mảng'
            }),
            status: Joi.string().valid(...Object.values(COMMON_CONSTANTS.PRODUCT_STATUS)).messages({
                'any.only': 'Trạng thái không hợp lệ'
            }),
            tags: Joi.array().items(Joi.string().trim()).messages({
                'array.base': 'Tags phải là một mảng string'
            })

        })
    },

    getProductById: {
        params: Joi.object().keys({
            id: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID không hợp lệ',
                'any.required': 'ID sản phẩm là bắt buộc'
            })
        })
    },

    getProductsByBranchId: {
        params: Joi.object().keys({
            branchId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'Branch ID không hợp lệ',
                'any.required': 'Branch ID là bắt buộc'
            })
        }),
        query: Joi.object().keys({
            page: Joi.number().min(1).default(1).messages({
                'number.base': 'Số trang phải là số',
                'number.min': 'Số trang không hợp lệ'
            }),
            limit: Joi.number().min(1).max(100).default(10).messages({
                'number.base': 'Limit phải là số',
                'number.min': 'Limit tối thiểu là 1',
                'number.max': 'Limit tối đa là 100'
            }),
            search: Joi.string().allow('', null).trim(),
            category: Joi.string().regex(REGEXP.OBJECT_ID).allow('', null).messages({
                'string.pattern.base': 'Category ID không hợp lệ',
            }),
            minPrice: Joi.number().min(0).allow('', null),
            maxPrice: Joi.number().min(0).allow('', null),
            status: Joi.string().valid(...Object.values(COMMON_CONSTANTS.PRODUCT_STATUS)).allow('', null),
            sortBy: Joi.string().valid('newest', 'price-asc', 'price-desc', 'rating-desc').default('newest'),
            rating: Joi.number().min(1).max(5).allow('', null)
        })
    }
};
