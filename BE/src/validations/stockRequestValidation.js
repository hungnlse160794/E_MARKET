import Joi from 'joi';
import { COMMON_CONSTANTS } from '#constants/common.js';

export const stockRequestValidation = {
    createRequest: {
        body: Joi.object({
            branchId: Joi.string().hex().length(24).required(),
            items: Joi.array().items(
                Joi.object({
                    productId: Joi.string().hex().length(24).required(),
                    quantity: Joi.number().min(1).required(),
                    name: Joi.string().optional()
                })
            ).min(1).required(),
            notes: Joi.string().allow('').max(500)
        })
    },

    updateStatus: {
        params: Joi.object({
            id: Joi.string().hex().length(24).required()
        }),
        body: Joi.object({
            status: Joi.string().valid(...Object.values(COMMON_CONSTANTS.STOCK_REQUEST_STATUS)).required(),
            rejectionReason: Joi.string().when('status', {
                is: COMMON_CONSTANTS.STOCK_REQUEST_STATUS.REJECTED,
                then: Joi.required(),
                otherwise: Joi.optional()
            })
        })
    },

    getRequestsByBranch: {
        params: Joi.object({
            branchId: Joi.string().hex().length(24).required()
        }),
        query: Joi.object({
            status: Joi.string().valid(...Object.values(COMMON_CONSTANTS.STOCK_REQUEST_STATUS)).optional(),
            page: Joi.number().min(1).default(1),
            limit: Joi.number().min(1).max(100).default(10)
        })
    },

    getRequestsByShop: {
        params: Joi.object({
            shopId: Joi.string().hex().length(24).required()
        }),
        query: Joi.object({
            status: Joi.string().valid(...Object.values(COMMON_CONSTANTS.STOCK_REQUEST_STATUS)).optional(),
            branchId: Joi.string().hex().length(24).optional(),
            page: Joi.number().min(1).default(1),
            limit: Joi.number().min(1).max(100).default(10)
        })
    }
};
