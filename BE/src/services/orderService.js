import mongoose from 'mongoose';
import { ORDER_REPOSITORY } from '#repositories/orderRepository.js';
import { CART_REPOSITORY } from '#repositories/cartRepository.js';
import { SHOP_REPOSITORY } from '#repositories/shopRepository.js';
import { VOUCHER_REPOSITORY } from '#repositories/voucherRepository.js';
import { INVENTORY_REPOSITORY } from '#repositories/inventoryRepository.js';
import { WALLET_REPOSITORY } from '#repositories/walletRepository.js';
import { PRODUCT_REPOSITORY } from '#repositories/productRepository.js';
import { voucherService } from '#services/voucherService.js';
import { notificationService } from '#services/notificationService.js';
import { walletService } from '#services/walletService.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { PERMISSION_UTIL } from '#utils/permissionUtil.js';
import ApiError from '#utils/ApiError.js';

export const orderService = {
    /**
     * Quy trình Thanh toán (Checkout) - Senior Senior Fullstack & BA optimized
     */
    checkout: async (checkoutData, requestUser) => {
        const { cartId, paymentMethod, shippingAddress, vouchers, note } = checkoutData;

        // 1. Kiểm tra giỏ hàng và Quyền
        const cart = await CART_REPOSITORY.findById(cartId);
        if (!cart || cart.items.length === 0) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Giỏ hàng trống hoặc không tồn tại']);
        }
        PERMISSION_UTIL.verifyAuthor(cart.ownerId, requestUser);

        // Đảm bảo không sử dụng mã giảm giá lặp lại
        const uniqueVouchers = [...new Set(vouchers || [])];

        // 2. NHÓM MÓN THEO SHOP & XÁC THỰC GIÁ TỪ DB (Anti Price Tampering)
        const shopsGroup = {};
        for (const item of cart.items) {
            const product = await PRODUCT_REPOSITORY.findById(item.productId);
            // BA Case: Kiểm tra sản phẩm còn tồn tại và đang AVAILABLE
            if (!product || product.status !== COMMON_CONSTANTS.PRODUCT_STATUS.AVAILABLE) {
                throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, [`Sản phẩm ${item.productId?.name || 'này'} hiện không sẵn sàng`]);
            }

            const unit = product.units.find(u => u.unitName === item.unitName);
            if (!unit) throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, [`Đơn vị tính ${item.unitName} không còn tồn tại`]);

            const currentPrice = unit.price;
            const sId = product.shopId.toString();

            if (!shopsGroup[sId]) {
                shopsGroup[sId] = { items: [], total: 0, branchId: item.branchId };
            }

            shopsGroup[sId].items.push({
                productId: product._id,
                name: product.name,
                unitName: item.unitName,
                price: currentPrice, // BẢO MẬT: Inject giá từ DB
                quantity: item.quantity
            });
            shopsGroup[sId].total += currentPrice * item.quantity;
        }

        const topologyType = mongoose.connection?.getClient()?.topology?.description?.type;
        const isReplicaSet = !!mongoose.connection?.replicaSet || (topologyType !== 'Standalone' && !!topologyType);
        let session = null;

        if (isReplicaSet) {
            try {
                session = await mongoose.startSession();
                session.startTransaction();
            } catch (err) {
                console.warn('⚠️ Transactions start failed despite being replica set. falling back.');
                session = null;
            }
        }

        try {
            let totalOrderAmount = 0;
            const subOrdersData = [];

            // 3. Xử lý logic tiền tệ cho từng SubOrder
            for (const sId in shopsGroup) {
                const shop = await SHOP_REPOSITORY.findById(sId);
                if (!shop) throw new ApiError(ERROR_CODES.SHOP_NOT_FOUND);

                const group = shopsGroup[sId];
                let subTotal = group.total;

                // 3.1. Áp voucher (Dùng session để atomic update count)
                for (const code of uniqueVouchers) {
                    try {
                        const discountRes = await voucherService.applyVoucher(code, sId, subTotal);
                        subTotal -= discountRes.discount;
                        group.appliedVoucherId = discountRes.voucherId;
                        await VOUCHER_REPOSITORY.incrementUsedCount(discountRes.voucherId, session);
                    } catch (err) {
                        continue; // Mã không hợp lệ cho shop này, bỏ qua
                    }
                }

                // 3.2. Tính toán phí và Kiểm tra kho (Lock stock)
                const platformFee = (subTotal * (shop.commissionRate || 10)) / 100;
                const netAmount = subTotal - platformFee;

                for (const item of group.items) {
                    const stock = await INVENTORY_REPOSITORY.reserveStock(
                        item.productId,
                        group.branchId,
                        item.quantity,
                        session
                    );
                    if (!stock) throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, [`Hết hàng cho: ${item.name}`]);
                }

                subOrdersData.push({
                    shopId: sId,
                    branchId: group.branchId,
                    items: group.items,
                    appliedVoucherId: group.appliedVoucherId,
                    subTotal,
                    platformFee,
                    netAmount,
                    status: COMMON_CONSTANTS.ORDER_STATUS.PENDING
                });

                totalOrderAmount += subTotal;
            }

            // 4. BA Case: Thanh toán bằng VÍ (WALLET) - Giai đoạn trừ tiền Atomic
            if (paymentMethod === 'WALLET') {
                // Trừ tiền trong Transaction để rollback nếu đơn hàng lỗi
                await walletService.payWithWallet(requestUser.userId, totalOrderAmount, 'PARENT-INTERNAL', session);
            }

            // 5. Tạo Parent/Sub Orders
            const parentOrder = await ORDER_REPOSITORY.createParent({
                userId: requestUser.userId,
                totalAmount: totalOrderAmount,
                paymentMethod,
                paymentStatus: paymentMethod === 'WALLET' ? COMMON_CONSTANTS.PAYMENT_STATUS.PAID : COMMON_CONSTANTS.PAYMENT_STATUS.PENDING,
                shippingAddress,
                appliedVouchers: uniqueVouchers,
                note
            }, session);

            for (const sub of subOrdersData) {
                const createdSub = await ORDER_REPOSITORY.createSub({
                    ...sub,
                    parentOrderId: parentOrder._id,
                    paymentStatus: paymentMethod === 'WALLET' ? COMMON_CONSTANTS.PAYMENT_STATUS.PAID : COMMON_CONSTANTS.PAYMENT_STATUS.PENDING
                }, session);

                // BA Case: Nếu đã thanh toán qua ví -> Treo tiền vào ví Shop (Escrow) ngay lập tức
                if (paymentMethod === 'WALLET') {
                    await WALLET_REPOSITORY.freezeBalance(sub.shopId, sub.netAmount, session);
                }
            }

            // 6. Chốt giỏ hàng
            await CART_REPOSITORY.update(cartId, { status: 'COMPLETED' }, session);

            if (session && session.inTransaction()) {
                await session.commitTransaction();
            }

            // 7. Async Notifications
            this._sendCheckoutNotifications(parentOrder, subOrdersData, requestUser, totalOrderAmount);

            return parentOrder;

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

    _sendCheckoutNotifications: (parentOrder, subOrdersData, requestUser, totalOrderAmount) => {
        notificationService.sendNotification({
            recipientId: requestUser.userId,
            title: 'Đặt hàng thành công',
            content: `Đơn hàng trị giá ${totalOrderAmount} VNĐ đã được khởi tạo.`,
            type: COMMON_CONSTANTS.NOTIFICATION_TYPE.SYSTEM,
            metaData: { parentOrderId: parentOrder._id }
        });

        for (const sub of subOrdersData) {
            notificationService.sendNotification({
                recipientId: sub.shopId,
                title: 'Đơn hàng mới',
                content: `Có đơn hàng mới chờ xử lý từ khách hàng ${requestUser.fullName}`,
                type: COMMON_CONSTANTS.NOTIFICATION_TYPE.NEW_ORDER,
                metaData: { shopId: sub.shopId, subOrderId: sub._id }
            });
        }
    },

    getParentOrderById: async (id, requestUser) => {
        const order = await ORDER_REPOSITORY.findParentById(id);
        if (!order) throw new ApiError(ERROR_CODES.ORDER_NOT_FOUND);
        PERMISSION_UTIL.verifyAuthor(order.userId, requestUser);
        const subOrders = await ORDER_REPOSITORY.findByParentId(id);
        return { ...order, subOrders };
    },

    updateSubOrderStatus: async (id, status, requestUser) => {
        const subOrder = await ORDER_REPOSITORY.findSubById(id);
        if (!subOrder) throw new ApiError(ERROR_CODES.ORDER_NOT_FOUND);

        PERMISSION_UTIL.verifyShopOwnership(subOrder.shopId._id || subOrder.shopId, requestUser);

        const updatedSubOrder = await ORDER_REPOSITORY.updateSubStatus(id, status);

        // Checklist: Giải phóng kho & Tiền (nếu có)
        if (status === COMMON_CONSTANTS.ORDER_STATUS.CANCELLED) {
            // Restore Inventory
            for (const item of subOrder.items) {
                await INVENTORY_REPOSITORY.releaseStock(
                    item.productId?._id || item.productId,
                    subOrder.branchId._id || subOrder.branchId,
                    item.quantity,
                    true
                );
            }

            // Nếu đã thanh toán qua ví mà hủy -> Hoàn tiền (Refund)
            if (subOrder.parentOrderId?.paymentMethod === COMMON_CONSTANTS.PAYMENT_METHOD.WALLET) {
                await walletService.refundSubOrderPayment(id);
            }
        } else if (status === COMMON_CONSTANTS.ORDER_STATUS.DELIVERED) {
            // Giải phóng tiền ký quỹ (Escrow) sang số dư khả dụng khi giao thành công
            if (subOrder.parentOrderId?.paymentMethod === COMMON_CONSTANTS.PAYMENT_METHOD.WALLET) {
                await walletService.completeSubOrderPayment(id);
            }
        }

        notificationService.sendNotification({
            recipientId: subOrder.parentOrderId.userId,
            title: 'Cập nhật đơn hàng',
            content: `Đơn tại ${subOrder.shopId.name}: ${status}`,
            type: COMMON_CONSTANTS.NOTIFICATION_TYPE.SYSTEM,
            metaData: { subOrderId: id, status }
        });

        return updatedSubOrder;
    }
};
