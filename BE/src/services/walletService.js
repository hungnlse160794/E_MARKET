import { WALLET_REPOSITORY } from '#repositories/walletRepository.js';
import { TRANSACTION_REPOSITORY } from '#repositories/transactionRepository.js';
import { ORDER_REPOSITORY } from '#repositories/orderRepository.js';
import { SHOP_REPOSITORY } from '#repositories/shopRepository.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { PERMISSION_UTIL } from '#utils/permissionUtil.js';
import ApiError from '#utils/ApiError.js';
import mongoose from 'mongoose';

export const walletService = {
    /**
     * Tạo ví cho Shop/User
     */
    createWallet: async (id, type = 'SHOP') => {
        const filter = type === 'SHOP' ? { shopId: id } : { userId: id };
        let wallet = await (type === 'SHOP' ? WALLET_REPOSITORY.findByShopId(id) : WALLET_REPOSITORY.findByUserId(id));
        if (wallet) return wallet;

        return await WALLET_REPOSITORY.create({ ...filter, balance: 0, frozenBalance: 0 });
    },

    getWalletByShop: async (shopId, requestUser) => {
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);
        const wallet = await WALLET_REPOSITORY.findByShopId(shopId);
        if (!wallet) throw new ApiError(ERROR_CODES.WALLET_NOT_FOUND);
        
        // Fetch 10 giao dịch gần nhất để hiển thị ở FE
        const transactionsResponse = await TRANSACTION_REPOSITORY.findByWallet(wallet._id, null, {
            limit: 10,
            sort: { createdAt: -1 }
        });

        return { 
            ...wallet, 
            transactions: transactionsResponse.docs // docs là kết quả từ mongoose-paginate-v2
        };
    },

    getPersonalWallet: async (requestUser) => {
        let wallet = await WALLET_REPOSITORY.findByUserId(requestUser.userId);
        if (!wallet) {
            wallet = await WALLET_REPOSITORY.create({ userId: requestUser.userId });
        }
        return wallet;
    },

    /**
     * Thanh toán bằng ví (Dành cho Checkout)
     */
    payWithWallet: async (userId, amount, parentOrderId, session) => {
        const result = await WALLET_REPOSITORY.deductBalance({ userId }, amount, session);
        if (!result) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Số dư ví không đủ']);
        }

        // Tạo bản ghi giao dịch
        await TRANSACTION_REPOSITORY.create({
            walletId: result._id,
            parentOrderId,
            amount: -amount,
            type: 'ORDER_PAYMENT',
            status: 'COMPLETED',
            description: `Thanh toán đơn hàng #${parentOrderId}`
        }, session);

        return result;
    },

    /**
     * Quy trình Escrow -> Balance (Giải phóng doanh thu cho Shop)
     */
    completeSubOrderPayment: async (subOrderId) => {
        const subOrder = await ORDER_REPOSITORY.findSubById(subOrderId);
        if (!subOrder) throw new ApiError(ERROR_CODES.ORDER_NOT_FOUND);

        const topologyType = mongoose.connection?.getClient()?.topology?.description?.type;
        const isReplicaSet = !!mongoose.connection?.replicaSet || (topologyType !== 'Standalone' && !!topologyType);
        let session = null;

        if (isReplicaSet) {
            try {
                session = await mongoose.startSession();
                session.startTransaction();
            } catch (err) {
                session = null;
            }
        }

        try {
            // 1. Chuyển tiền Net cho Shop (frozenBalance -> balance)
            await WALLET_REPOSITORY.releaseFrozenBalance(subOrder.shopId._id, subOrder.netAmount, session);

            // 2. Chuyển Platform Fee cho Ví Admin (Sàn)
            if (subOrder.platformFee > 0) {
                const adminWallet = await Wallet.findOne({ isSystemWallet: true }, null, { session });
                if (adminWallet) {
                    await WALLET_REPOSITORY.addBalance({ _id: adminWallet._id }, subOrder.platformFee, session);
                    
                    await TRANSACTION_REPOSITORY.create({
                        walletId: adminWallet._id,
                        orderId: subOrder._id,
                        amount: subOrder.platformFee,
                        type: 'FEE_INCOME',
                        status: 'COMPLETED',
                        description: `Phí sàn từ đơn hàng #${subOrder._id}`
                    }, session);
                }
            }

            await TRANSACTION_REPOSITORY.create({
                walletId: subOrder.shopId._id,
                orderId: subOrder._id,
                amount: subOrder.netAmount,
                type: 'ORDER_INCOME',
                status: 'COMPLETED',
                description: `Tiền thu từ đơn hàng #${subOrder._id}`
            }, session);

            if (session && session.inTransaction()) {
                await session.commitTransaction();
            }
            return true;
        } catch (error) {
            if (session && session.inTransaction()) {
                await session.abortTransaction();
            }
            throw error;
        } finally {
            if (session) {
                session.endSession();
            }
        }
    },

    /**
     * Quy trình Hoàn tiền (Refund) khi Admin/Khách hủy đơn
     */
    refundSubOrderPayment: async (subOrderId) => {
        const subOrder = await ORDER_REPOSITORY.findSubById(subOrderId);
        if (!subOrder) throw new ApiError(ERROR_CODES.ORDER_NOT_FOUND);

        const topologyType = mongoose.connection?.getClient()?.topology?.description?.type;
        const isReplicaSet = !!mongoose.connection?.replicaSet || (topologyType !== 'Standalone' && !!topologyType);
        let session = null;

        if (isReplicaSet) {
            try {
                session = await mongoose.startSession();
                session.startTransaction();
            } catch (err) {
                session = null;
            }
        }

        try {
            // 1. Trừ frozenBalance của Shop (Số tiền net)
            await WALLET_REPOSITORY.freezeBalance(subOrder.shopId._id, -subOrder.netAmount, session);

            // 2. Hoàn lại tiền cho User (Hoàn lại toàn bộ subTotal mà User đã mua của Shop này)
            const userId = subOrder.parentOrderId.userId;
            let userWallet = await WALLET_REPOSITORY.findByUserId(userId);
            if (!userWallet) userWallet = await WALLET_REPOSITORY.create({ userId }, session);
            
            await WALLET_REPOSITORY.addBalance({ _id: userWallet._id }, subOrder.subTotal, session);

            // 3. Ghi log Transaction
            await TRANSACTION_REPOSITORY.create({
                walletId: userWallet._id,
                referenceId: subOrder._id,
                amount: subOrder.subTotal,
                type: COMMON_CONSTANTS.TRANSACTION_TYPE.REFUND,
                status: COMMON_CONSTANTS.TRANSACTION_STATUS.COMPLETED,
                description: `Hoàn tiền hủy đơn hàng #${subOrder._id}`
            }, session);

            if (session && session.inTransaction()) {
                await session.commitTransaction();
            }
            return true;
        } catch (error) {
            if (session && session.inTransaction()) {
                await session.abortTransaction();
            }
            throw error;
        } finally {
            if (session) {
                session.endSession();
            }
        }
    },

    /**
     * Yêu cầu rút tiền (Cho Shop Owner)
     */
    requestWithdrawal: async (shopId, amount, requestUser) => {
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);
        
        if (!amount || amount < 50000) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Số tiền rút tối thiểu là 50,000đ']);
        }
        
        const topologyType = mongoose.connection?.getClient()?.topology?.description?.type;
        const isReplicaSet = !!mongoose.connection?.replicaSet || (topologyType !== 'Standalone' && !!topologyType);
        let session = null;

        if (isReplicaSet) {
            try {
                session = await mongoose.startSession();
                session.startTransaction();
            } catch (err) {
                session = null;
            }
        }

        try {
            // 1. Tính toán phí rút tiền (2%)
            const withdrawalFee = amount * 0.02;
            const totalDeduction = amount + withdrawalFee;

            // 2. Trừ tiền khỏi Balance khả dụng (Cả tiền rút + phí)
            const wallet = await WALLET_REPOSITORY.deductBalance({ shopId }, totalDeduction, session);
            if (!wallet) {
                throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, [`Số dư không đủ. Cần ${totalDeduction.toLocaleString()}đ (bao gồm 2% phí rút tiền)`]);
            }

            // 3. Tạo Giao dịch rút tiền (PENDING) - Lưu số tiền thực nhận sau phí? 
            // Thường lưu số tiền yêu cầu và phí riêng. Ở đây ta lưu gộp hoặc log description.
            const txn = await TRANSACTION_REPOSITORY.create({
                walletId: wallet._id,
                amount: amount, 
                fee: withdrawalFee,
                type: COMMON_CONSTANTS.TRANSACTION_TYPE.WITHDRAWAL,
                status: COMMON_CONSTANTS.TRANSACTION_STATUS.PENDING,
                description: `Yêu cầu rút: ${amount.toLocaleString()}đ. Phí (2%): ${withdrawalFee.toLocaleString()}đ`
            }, session);

            if (session && session.inTransaction()) {
                await session.commitTransaction();
            }
            return txn;
        } catch (err) {
            if (session && session.inTransaction()) {
                await session.abortTransaction();
            }
            throw err;
        } finally {
            if (session) {
                session.endSession();
            }
        }
    },

    /**
     * Phê duyệt/Từ chối lệnh rút tiền (Cho Admin)
     */
    reviewWithdrawal: async (txnId, action, requestUser) => {
        if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
            throw new ApiError(ERROR_CODES.FORBIDDEN, ['Chỉ Admin mới có quyền duyệt rút tiền']);
        }

        const topologyType = mongoose.connection?.getClient()?.topology?.description?.type;
        const isReplicaSet = !!mongoose.connection?.replicaSet || (topologyType !== 'Standalone' && !!topologyType);
        let session = null;

        if (isReplicaSet) {
            try {
                session = await mongoose.startSession();
                session.startTransaction();
            } catch (err) {
                session = null;
            }
        }

        try {
            const txn = await TRANSACTION_REPOSITORY.findById(txnId);
            if (!txn) throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Giao dịch không tồn tại']);
            
            const wallet = await Wallet.findById(txn.walletId).lean();
            if (wallet.isSystemWallet && requestUser.role !== COMMON_CONSTANTS.USER_ROLE.SUPER_ADMIN) {
                throw new ApiError(ERROR_CODES.FORBIDDEN, ['Chỉ Super Admin mới được duyệt lệnh rút từ Ví Sàn']);
            }

            if (txn.status !== COMMON_CONSTANTS.TRANSACTION_STATUS.PENDING) {
                throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Giao dịch này đã được xử lý']);
            }

            if (action === 'APPROVE') {
                await TRANSACTION_REPOSITORY.updateStatus(txnId, COMMON_CONSTANTS.TRANSACTION_STATUS.COMPLETED, session);
            } else if (action === 'REJECT') {
                await TRANSACTION_REPOSITORY.updateStatus(txnId, COMMON_CONSTANTS.TRANSACTION_STATUS.FAILED, session);
                // Hoàn lại tiền (gồm cả phí) vào Wallet
                const restoreAmount = txn.amount + (txn.fee || 0);
                await WALLET_REPOSITORY.addBalance({ _id: txn.walletId }, restoreAmount, session);
            } else {
                throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Hành động không hợp lệ']);
            }

            if (session && session.inTransaction()) {
                await session.commitTransaction();
            }
            return { message: `Đã ${action === 'APPROVE' ? 'PHÊ DUYỆT' : 'TỪ CHỐI'} lệnh rút tiền` };
        } catch(err) {
            if (session && session.inTransaction()) {
                await session.abortTransaction();
            }
            throw err;
        } finally {
            if (session) {
                session.endSession();
            }
        }
    },

    /**
     * Cập nhật thông tin ngân hàng cho Ví (SaaS Compliance)
     */
    updateBankInfo: async (walletId, bankInfo, requestUser) => {
        const wallet = await Wallet.findById(walletId);
        if (!wallet) throw new ApiError(ERROR_CODES.WALLET_NOT_FOUND);

        // Security Check
        if (wallet.isSystemWallet) {
            if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.SUPER_ADMIN) {
                throw new ApiError(ERROR_CODES.FORBIDDEN, ['Chỉ Super Admin mới được sửa thông tin ngân hàng của Sàn']);
            }
        } else if (wallet.shopId) {
            PERMISSION_UTIL.verifyShopOwnership(wallet.shopId, requestUser);
        } else {
            if (wallet.userId.toString() !== requestUser.userId.toString()) {
                throw new ApiError(ERROR_CODES.FORBIDDEN);
            }
        }

        return await Wallet.findByIdAndUpdate(walletId, { bankInfo }, { new: true }).lean();
    },

    /**
     * Lấy thông tin Ví Hệ thống (System Wallet)
     */
    getSystemWallet: async () => {
        return await Wallet.findOne({ isSystemWallet: true }).lean();
    }
};
