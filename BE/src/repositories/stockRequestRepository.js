import { StockRequest } from '#models/stockRequestModel.js';

export const STOCK_REQUEST_REPOSITORY = {
    create: async (data, session = null) => {
        const doc = new StockRequest(data);
        return await doc.save({ session });
    },

    findById: async (id) => {
        return await StockRequest.findById(id)
            .populate('shopId', 'name logo')
            .populate('branchId', 'branchName address')
            .populate('requesterId', 'fullName')
            .populate('approverId', 'fullName')
            .populate('items.productId', 'name images')
            .lean();
    },

    findByBranch: async (branchId, query = {}) => {
        return await StockRequest.paginate(
            { branchId, isDeleted: false, ...query },
            { 
                sort: { createdAt: -1 }, 
                lean: true, 
                populate: [
                    { path: 'shopId', select: 'name logo' },
                    { path: 'branchId', select: 'branchName address' },
                    { path: 'requesterId', select: 'fullName' },
                    { path: 'items.productId', select: 'name images' }
                ] 
            }
        );
    },

    findByShop: async (shopId, query = {}) => {
        return await StockRequest.paginate(
            { shopId, isDeleted: false, ...query },
            { 
                sort: { createdAt: -1 }, 
                lean: true, 
                populate: [
                    { path: 'shopId', select: 'name logo' },
                    { path: 'branchId', select: 'branchName address' },
                    { path: 'requesterId', select: 'fullName' },
                    { path: 'items.productId', select: 'name images' }
                ] 
            }
        );
    },

    updateStatus: async (id, status, approverId = null, rejectionReason = null, session = null) => {
        const update = { status };
        if (approverId) update.approverId = approverId;
        if (rejectionReason) update.rejectionReason = rejectionReason;
        
        return await StockRequest.findByIdAndUpdate(
            id,
            update,
            { new: true, session }
        ).lean();
    }
};
