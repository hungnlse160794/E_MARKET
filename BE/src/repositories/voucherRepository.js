import { Voucher } from '#models/voucherModel.js';

export const VOUCHER_REPOSITORY = {
    create: async (voucherData) => {
        const voucher = new Voucher(voucherData);
        return await voucher.save();
    },

    findByCode: async (code) => {
        return await Voucher.findOne({ code, isDeleted: false }).lean();
    },

    findById: async (id) => {
        return await Voucher.findOne({ _id: id, isDeleted: false }).lean();
    },

    updateById: async (id, updateData) => {
        return await Voucher.findOneAndUpdate(
            { _id: id, isDeleted: false }, 
            updateData, 
            { new: true }
        ).lean();
    },

    deleteById: async (id) => {
        return await Voucher.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean();
    },

    findPlatformVouchers: async () => {
        return await Voucher.find({ shopId: null, isDeleted: false }).sort({ createdAt: -1 }).lean();
    },

    findShopVouchers: async (shopId) => {
        return await Voucher.find({ shopId, isDeleted: false }).sort({ createdAt: -1 }).lean();
    },

    incrementUsedCount: async (id, session = null) => {
        return await Voucher.findByIdAndUpdate(
            id, 
            { $inc: { usedCount: 1 } }, 
            { session, new: true }
        );
    }
};
