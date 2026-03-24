import { ParentOrder, SubOrder } from '#models/index.js';
import { COMMON_CONSTANTS } from '#constants/common.js';

export const ORDER_REPOSITORY = {
    // Parent Order
    createParent: async (parentData, session = null) => {
        const order = new ParentOrder(parentData);
        return await order.save({ session });
    },

    findParentById: async (id) => {
        return await ParentOrder.findOne({ _id: id, isDeleted: false }).lean();
    },

    paginateParentsByUser: async (userId, options) => {
        return await ParentOrder.paginate({ userId, isDeleted: false }, options);
    },

    updateParentPaymentStatus: async (id, status, session = null) => {
        return await ParentOrder.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { paymentStatus: status },
            { new: true, session }
        ).lean();
    },

    // Sub Order
    createSub: async (subData, session = null) => {
        const sub = new SubOrder(subData);
        return await sub.save({ session });
    },

    findSubById: async (id) => {
        return await SubOrder.findOne({ _id: id, isDeleted: false }).populate('shopId branchId parentOrderId').lean();
    },

    findByParentId: async (parentId) => {
        return await SubOrder.find({ parentOrderId: parentId, isDeleted: false }).lean();
    },

    paginateSubsByShop: async (shopId, status, options) => {
        const query = { shopId, isDeleted: false };
        if (status) query.status = status;
        return await SubOrder.paginate(query, options);
    },

    paginateSubsByBranch: async (branchId, status, options) => {
        const query = { branchId, isDeleted: false };
        if (status) query.status = status;
        return await SubOrder.paginate(query, options);
    },

    updateSubStatus: async (id, status, session = null) => {
        return await SubOrder.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { status },
            { new: true, session }
        ).lean();
    },

    updateSubsPaymentStatusByParentId: async (parentOrderId, status, session = null) => {
        return await SubOrder.updateMany(
            { parentOrderId, isDeleted: false },
            { paymentStatus: status },
            { session }
        );
    },

    findExpiredParents: async (minutesAgo = 20) => {
        const timeoutDate = new Date(Date.now() - minutesAgo * 60 * 1000);
        return await ParentOrder.find({
            paymentStatus: COMMON_CONSTANTS.PAYMENT_STATUS.PENDING,
            createdAt: { $lt: timeoutDate },
            isDeleted: false
        }).lean();
    }
};
