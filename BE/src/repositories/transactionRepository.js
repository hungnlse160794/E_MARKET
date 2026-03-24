import { Transaction } from '#models/index.js';

export const TRANSACTION_REPOSITORY = {
    create: async (transactionData, session = null) => {
        const transaction = new Transaction(transactionData);
        return await transaction.save({ session });
    },

    findById: async (id) => {
        return await Transaction.findById(id).lean();
    },

    findByOrderId: async (orderId) => {
        return await Transaction.find({ orderId }).lean();
    },

    findByWallet: async (walletId, type, options) => {
        const query = { walletId };
        if (type) query.type = type;
        return await Transaction.paginate(query, options);
    },

    updateStatus: async (id, status, session = null) => {
        return await Transaction.findByIdAndUpdate(id, { status }, { new: true, session }).lean();
    }
};
