import { Wallet } from '#models/walletModel.js';

export const WALLET_REPOSITORY = {
    create: async (walletData, session = null) => {
        const wallet = new Wallet(walletData);
        return await wallet.save({ session });
    },

    findByShopId: async (shopId) => {
        return await Wallet.findOne({ shopId }).lean();
    },

    findByUserId: async (userId) => {
        return await Wallet.findOne({ userId }).lean();
    },

    /**
     * Tăng số dư (Dùng cho nạp tiền, nhận doanh thu, hoàn đơn)
     * Đối tượng: { shopId } HOẶC { userId }
     */
    addBalance: async (filter, amount, session = null) => {
        return await Wallet.findOneAndUpdate(
            filter,
            { $inc: { balance: amount } },
            { new: true, session }
        ).lean();
    },

    /**
     * Trừ số dư (Dùng khi thanh toán ví)
     */
    deductBalance: async (filter, amount, session = null) => {
        return await Wallet.findOneAndUpdate(
            { ...filter, balance: { $gte: amount } }, // Đảm bảo số dư đủ (Atomic check)
            { $inc: { balance: -amount } },
            { new: true, session }
        ).lean();
    },

    /**
     * Đóng băng tiền (Escrow)
     */
    freezeBalance: async (shopId, amount, session = null) => {
        return await Wallet.findOneAndUpdate(
            { shopId },
            { $inc: { frozenBalance: amount } },
            { new: true, session }
        ).lean();
    },

    /**
     * Giải phóng tiền đóng băng (Freeze -> Balance)
     */
    releaseFrozenBalance: async (shopId, amount, session = null) => {
        return await Wallet.findOneAndUpdate(
            { shopId },
            { 
                $inc: { 
                    balance: amount, 
                    frozenBalance: -amount 
                } 
            },
            { new: true, session }
        ).lean();
    },

    updateStatus: async (filter, status, session = null) => {
        return await Wallet.findOneAndUpdate(
            filter,
            { status },
            { new: true, session }
        ).lean();
    }
};
