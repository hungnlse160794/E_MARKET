import Joi from 'joi';
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const chatValidation = {
    startConversation: {
        body: Joi.object().keys({
            shopId: Joi.string().regex(OBJECT_ID_REGEX).required().messages({
                'string.pattern.base': 'ID gian hàng không hợp lệ'
            })
        })
    },

    sendMessage: {
        body: Joi.object().keys({
            conversationId: Joi.string().regex(OBJECT_ID_REGEX).required(),
            text: Joi.string().trim().required().max(2000).messages({
                'string.empty': 'Tin nhắn không được để trống',
                'string.max': 'Tin nhắn quá dài (tối đa 2000 ký tự)'
            }),
            type: Joi.string().valid('TEXT', 'IMAGE', 'ORDER_REF').default('TEXT')
        })
    },

    getMessages: {
        params: Joi.object().keys({
            conversationId: Joi.string().regex(OBJECT_ID_REGEX).required()
        }),
        query: Joi.object().keys({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(50)
        })
    }
};
