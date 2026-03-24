import Joi from 'joi';
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const blogValidation = {
    createBlog: {
        body: Joi.object().keys({
            title: Joi.string().required().min(10).max(150).trim().messages({
                'string.empty': 'Tiêu đề không được để trống',
                'string.min': 'Tiêu đề phải có ít nhất 10 ký tự',
                'string.max': 'Tiêu đề không được vượt quá 150 ký tự'
            }),
            contentHTML: Joi.string().required().min(50).messages({
                'string.empty': 'Nội dung không được để trống',
                'string.min': 'Nội dung quá ngắn (tối thiểu 50 ký tự)'
            }),
            summary: Joi.string().max(500).allow('').messages({
                'string.max': 'Mô tả ngắn không được vượt quá 500 ký tự'
            }),
            thumbnail: Joi.string().uri().allow('').messages({
                'string.uri': 'Ảnh bìa phải là một liên kết hợp lệ'
            }),
            shopId: Joi.string().regex(OBJECT_ID_REGEX).allow(null),
            tags: Joi.array().items(Joi.string().trim()).max(5).messages({
                'array.max': 'Chỉ được chọn tối đa 5 thẻ'
            }),
            status: Joi.string().valid('PUBLISHED', 'DRAFT', 'HIDDEN').default('PUBLISHED'),
            seoMeta: Joi.object().keys({
                title: Joi.string().max(100),
                description: Joi.string().max(200),
                keywords: Joi.array().items(Joi.string())
            })
        })
    },

    updateBlog: {
        params: Joi.object().keys({
            id: Joi.string().regex(OBJECT_ID_REGEX).required()
        }),
        body: Joi.object().keys({
            title: Joi.string().min(10).max(150).trim(),
            contentHTML: Joi.string().min(50),
            summary: Joi.string().max(500),
            thumbnail: Joi.string().uri(),
            status: Joi.string().valid('PUBLISHED', 'DRAFT', 'HIDDEN'),
            tags: Joi.array().items(Joi.string().trim()).max(5),
            seoMeta: Joi.object().keys({
                title: Joi.string().max(100),
                description: Joi.string().max(200),
                keywords: Joi.array().items(Joi.string())
            })
        })
    }
};
