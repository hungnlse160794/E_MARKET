import Joi from 'joi';
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const reviewValidation = {
    createReview: {
        body: Joi.object().keys({
            subOrderId: Joi.string().regex(OBJECT_ID_REGEX).required().messages({
                'string.pattern.base': 'ID đơn hàng không hợp lệ'
            }),
            productId: Joi.string().regex(OBJECT_ID_REGEX).required(),
            shopId: Joi.string().regex(OBJECT_ID_REGEX).required(),
            rating: Joi.number().integer().min(1).max(5).required().messages({
                'number.min': 'Đánh giá tối thiểu là 1 sao',
                'number.max': 'Đánh giá tối đa là 5 sao',
                'any.required': 'Số sao đánh giá là bắt buộc'
            }),
            comment: Joi.string().trim().max(500).allow('').messages({
                'string.max': 'Bình luận không được vượt quá 500 ký tự'
            }),
            images: Joi.array().items(Joi.string().uri()).max(5).messages({
                'array.max': 'Chỉ được tải lên tối đa 5 hình ảnh'
            })
        })
    },

    getReviews: {
        query: Joi.object().keys({
            productId: Joi.string().regex(OBJECT_ID_REGEX),
            shopId: Joi.string().regex(OBJECT_ID_REGEX),
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(50).default(10)
        })
    }
};
