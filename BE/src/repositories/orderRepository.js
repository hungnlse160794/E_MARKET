import { ParentOrder, SubOrder } from '#models/index.js';

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
    }
};
