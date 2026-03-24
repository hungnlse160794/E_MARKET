import Joi from 'joi';

import { REGEXP } from '#constants/regexp.js';

export const branchValidation = {
    createBranch: {
        body: Joi.object().keys({
            shopId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID gian hàng không hợp lệ',
                'any.required': 'ID gian hàng là bắt buộc'
            }),
            branchName: Joi.string().required().min(2).max(100).trim().messages({
                'string.empty': 'Tên chi nhánh không được để trống',
                'string.min': 'Tên chi nhánh phải có ít nhất {#limit} ký tự',
                'string.max': 'Tên chi nhánh không được vượt quá {#limit} ký tự',
                'any.required': 'Tên chi nhánh là bắt buộc'
            }),
            address: Joi.object().keys({
                province: Joi.string().trim().messages({
                    'string.empty': 'Tỉnh/Thành phố không được để trống'
                }),
                district: Joi.string().trim().messages({
                    'string.empty': 'Quận/Huyện không được để trống'
                }),
                ward: Joi.string().trim().messages({
                    'string.empty': 'Phường/Xã không được để trống'
                }),
                street: Joi.string().trim().messages({
                    'string.empty': 'Số nhà/Đường không được để trống'
                }),
                fullAddress: Joi.string().required().min(5).max(200).trim().messages({
                    'string.empty': 'Địa chỉ đầy đủ không được để trống',
                    'string.min': 'Địa chỉ đầy đủ phải có ít nhất {#limit} ký tự',
                    'string.max': 'Địa chỉ đầy đủ không được vượt quá {#limit} ký tự',
                    'any.required': 'Địa chỉ đầy đủ là bắt buộc'
                })
            }).messages({
                'object.base': 'Địa chỉ phải là một đối tượng hợp lệ'
            }),
            location: Joi.object().keys({
                type: Joi.string().valid('Point').default('Point').messages({
                    'any.only': 'Kiểu toạ độ phải là "Point"'
                }),
                coordinates: Joi.array().items(Joi.number()).length(2).messages({
                    'array.length': 'Toạ độ phải gồm đúng 2 giá trị [kinh độ, vĩ độ]',
                    'number.base': 'Giá trị toạ độ phải là số'
                })
            }).messages({
                'object.base': 'Vị trí phải là một đối tượng hợp lệ'
            }),
            contactPhone: Joi.string().regex(REGEXP.PHONE).messages({
                'string.pattern.base': 'Số điện thoại không hợp lệ (10-11 số)'
            }),
            workingHours: Joi.object().keys({
                open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
                    'string.pattern.base': 'Giờ mở cửa phải theo định dạng HH:mm (VD: 08:00)'
                }),
                close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
                    'string.pattern.base': 'Giờ đóng cửa phải theo định dạng HH:mm (VD: 22:00)'
                })
            }).messages({
                'object.base': 'Giờ làm việc phải là một đối tượng hợp lệ'
            })
        })
    },

    updateBranch: {
        params: Joi.object().keys({
            id: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID chi nhánh không hợp lệ'
            })
        }),
        body: Joi.object().keys({
            branchName: Joi.string().min(2).max(100).trim().messages({
                'string.empty': 'Tên chi nhánh không được để trống',
                'string.min': 'Tên chi nhánh phải có ít nhất {#limit} ký tự',
                'string.max': 'Tên chi nhánh không được vượt quá {#limit} ký tự'
            }),
            address: Joi.object().keys({
                province: Joi.string().trim(),
                district: Joi.string().trim(),
                ward: Joi.string().trim(),
                street: Joi.string().trim(),
                fullAddress: Joi.string().min(5).max(200).trim().messages({
                    'string.min': 'Địa chỉ đầy đủ phải có ít nhất {#limit} ký tự',
                    'string.max': 'Địa chỉ đầy đủ không được vượt quá {#limit} ký tự'
                })
            }),
            location: Joi.object().keys({
                type: Joi.string().valid('Point').default('Point'),
                coordinates: Joi.array().items(Joi.number()).length(2).messages({
                    'array.length': 'Toạ độ phải gồm đúng 2 giá trị [kinh độ, vĩ độ]'
                })
            }),
            contactPhone: Joi.string().regex(REGEXP.PHONE).messages({
                'string.pattern.base': 'Số điện thoại không hợp lệ (10-11 số)'
            }),
            isOpen: Joi.boolean().messages({
                'boolean.base': 'Trạng thái mở/đóng phải là kiểu boolean'
            }),
            workingHours: Joi.object().keys({
                open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
                    'string.pattern.base': 'Giờ mở cửa phải theo định dạng HH:mm'
                }),
                close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
                    'string.pattern.base': 'Giờ đóng cửa phải theo định dạng HH:mm'
                })
            })
        })
    },

    getBranchById: {
        params: Joi.object().keys({
            id: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID chi nhánh không hợp lệ'
            })
        })
    },

    getBranchesByShopId: {
        params: Joi.object().keys({
            shopId: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
                'string.pattern.base': 'ID gian hàng không hợp lệ'
            })
        })
    }
};
