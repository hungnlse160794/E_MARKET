import mongoose from 'mongoose';
import { ORDER_REPOSITORY } from '#repositories/orderRepository.js';
import { CART_REPOSITORY } from '#repositories/cartRepository.js';
import { SHOP_REPOSITORY } from '#repositories/shopRepository.js';
import { VOUCHER_REPOSITORY } from '#repositories/voucherRepository.js';
import { INVENTORY_REPOSITORY } from '#repositories/inventoryRepository.js';
import { WALLET_REPOSITORY } from '#repositories/walletRepository.js';
import { PRODUCT_REPOSITORY } from '#repositories/productRepository.js';
import { BRANCH_REPOSITORY } from '#repositories/branchRepository.js';
import { voucherService } from '#services/voucherService.js';
import { shippingService } from '#services/shippingService.js';
import { notificationService } from '#services/notificationService.js';
import { walletService } from '#services/walletService.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { PERMISSION_UTIL } from '#utils/permissionUtil.js';
import { VNPayUtil } from '#utils/vnpay.js';
import ApiError from '#utils/ApiError.js';

export const orderService = {
    /**
     * Checkout giỏ hàng chuyên sâu (Atomic - Multiple Shops)
     */
    checkout: async (payload, requestUser, ipAddr) => {
        const { cartId, paymentMethod, shippingAddress, vouchers, note } = payload;

        // 1. Kiểm tra giỏ hàng và Quyền (Security Layer)
        const cart = await CART_REPOSITORY.findById(cartId);
        if (!cart || cart.items.length === 0 || cart.status !== 'ACTIVE') {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Giỏ hàng không hợp lệ hoặc đã được thanh toán']);
        }
        
        // BA Case: Chỉ Owner mới được thanh toán giỏ hàng chung
        if (cart.ownerId.toString() !== requestUser.userId.toString()) {
            throw new ApiError(ERROR_CODES.FORBIDDEN, ['Chỉ chủ phòng mới có quyền tiến hành thanh toán']);
        }

        const uniqueCodes = [...new Set(vouchers || [])];
        const platformVouchers = [];
        const shopBranchVouchers = [];

        // Pre-fetch and categorize vouchers (Optimized for Senior BA rules)
        // Pre-fetch and categorize vouchers (Optimized for Senior BA rules - SECURE CHECK)
        for (const code of uniqueCodes) {
            const v = await VOUCHER_REPOSITORY.findByCodeWithCreator(code);
            if (!v) continue;
            
            // SECURITY: Phân biệt voucher SÀN vs CHI NHÁNH qua ROLE người tạo
            if (v.createdBy?.role === COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
                platformVouchers.push(v);
            } else if (v.branchId) {
                // Voucher của Shop phải có branchId (Theo Senior BA Phase 1)
                shopBranchVouchers.push(v);
            }
        }

        // 2. NHÓM MÓN THEO SHOP & BRANCH (Marketplace Grouping)
        const groupKeyMap = {};
        for (const item of cart.items) {
            const product = await PRODUCT_REPOSITORY.findById(item.productId);
            if (!product || product.status !== COMMON_CONSTANTS.PRODUCT_STATUS.AVAILABLE) {
                throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, [`Sản phẩm ${item.name || 'này'} hiện không khả dụng`]);
            }

            const unit = product.units.find(u => u.unitName === item.unitName);
            if (!unit) throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, [`Đơn vị tính ${item.unitName} của ${product.name} không còn tồn tại`]);

            const currentPrice = unit.price;
            const shopId = product.shopId.toString();
            const branchId = item.branchId.toString();
            const key = `${shopId}_${branchId}`;

            if (!groupKeyMap[key]) {
                groupKeyMap[key] = { 
                    shopId, branchId, items: [], subTotal: 0,
                    appliedVoucherId: null, discount: 0
                };
            }

            groupKeyMap[key].items.push({
                productId: product._id,
                name: product.name,
                unitName: item.unitName,
                unitNameSnapshot: item.unitName,
                price: currentPrice,
                priceAtPurchase: currentPrice,
                quantity: item.quantity
            });
            groupKeyMap[key].subTotal += currentPrice * item.quantity;
        }

        // 3. ATOMIC TRANSACTION START (ACID Guarantee)
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            let totalOrderAmount = 0;
            const subOrdersToCreate = [];

            // A. Xử lý SubOrders & Chi nhánh Voucher
            for (const key in groupKeyMap) {
                const group = groupKeyMap[key];
                const shop = await SHOP_REPOSITORY.findById(group.shopId);
                if (!shop) throw new ApiError(ERROR_CODES.SHOP_NOT_FOUND);

                // Áp Voucher Chi nhánh
                for (const v of shopBranchVouchers) {
                    if (v.branchId.toString() === group.branchId.toString()) {
                        try {
                            const res = await voucherService.applyVoucher(v.code, group.shopId, group.subTotal, group.branchId);
                            group.discount += res.discount;
                            group.appliedVoucherId = res.voucherId;
                            await VOUCHER_REPOSITORY.incrementUsedCount(res.voucherId, session);
                        } catch (err) { continue; }
                    }
                }

                const branch = await BRANCH_REPOSITORY.findById(group.branchId);
                const shippingFee = await shippingService.calculateShippingFee(
                    branch?.address?.districtId, branch?.address?.wardCode,
                    shippingAddress.districtId, shippingAddress.wardCode
                );

                const finalSubAfterShopDiscount = Math.max(0, group.subTotal - group.discount);
                const platformFee = (finalSubAfterShopDiscount * (shop.commissionRate || 10)) / 100;
                
                // 3.3. Inventory Reservation (Early Lock)
                for (const item of group.items) {
                    const success = await INVENTORY_REPOSITORY.reserveStock(
                        item.productId, group.branchId, item.quantity, session
                    );
                    if (!success) {
                        throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, [`Sản phẩm ${item.name} đã hết hàng tại chi nhánh được chọn`]);
                    }
                }

                subOrdersToCreate.push({
                    shopId: group.shopId,
                    branchId: group.branchId,
                    items: group.items,
                    appliedVoucherId: group.appliedVoucherId,
                    subTotal: finalSubAfterShopDiscount + shippingFee,
                    shippingFee,
                    platformFee,
                    netAmount: finalSubAfterShopDiscount - platformFee,
                    status: COMMON_CONSTANTS.ORDER_STATUS.PENDING
                });

                totalOrderAmount += (finalSubAfterShopDiscount + shippingFee);
            }

            // B. Áp Voucher SÀN (Platform/Admin)
            let platformDiscount = 0;
            const appliedPlatformVoucherCodes = [];
            for (const v of platformVouchers) {
                try {
                    const res = await voucherService.applyVoucher(v.code, null, totalOrderAmount);
                    platformDiscount += res.discount;
                    appliedPlatformVoucherCodes.push(v.code);
                    await VOUCHER_REPOSITORY.incrementUsedCount(v._id, v.usageLimit, session);
                } catch (err) { continue; }
            }
            totalOrderAmount = Math.max(0, totalOrderAmount - platformDiscount);

            // 4. Thanh toán VÍ
            if (paymentMethod === COMMON_CONSTANTS.PAYMENT_METHOD.WALLET) {
                await walletService.payWithWallet(requestUser.userId, totalOrderAmount, 'PURCHASE_ORDER', session);
            }

            // 5. Khởi tạo Parent Order
            const parentOrder = await ORDER_REPOSITORY.createParent({
                userId: requestUser.userId,
                totalAmount: totalOrderAmount,
                paymentMethod,
                paymentStatus: paymentMethod === COMMON_CONSTANTS.PAYMENT_METHOD.WALLET 
                    ? COMMON_CONSTANTS.PAYMENT_STATUS.PAID 
                    : COMMON_CONSTANTS.PAYMENT_STATUS.PENDING,
                shippingAddress,
                appliedVouchers: [...appliedPlatformVoucherCodes, ...shopBranchVouchers.map(v => v.code)],
                note
            }, session);

            // 6. Khởi tạo Sub Orders & Escrow
            for (const sub of subOrdersToCreate) {
                const subOrder = await ORDER_REPOSITORY.createSub({
                    ...sub,
                    parentOrderId: parentOrder._id,
                    paymentStatus: parentOrder.paymentStatus
                }, session);

                if (parentOrder.paymentStatus === COMMON_CONSTANTS.PAYMENT_STATUS.PAID) {
                    await WALLET_REPOSITORY.freezeBalance(sub.shopId, sub.netAmount, session);
                }
            }

            // 7. Chốt giỏ hàng
            await CART_REPOSITORY.update(cartId, { status: 'COMPLETED' }, session);

            // 8. Tạo VNPay Payment URL (nếu dùng VNPAY)
            let paymentUrl = null;
            if (paymentMethod === COMMON_CONSTANTS.PAYMENT_METHOD.VNPAY) {
                const returnUrl = `${process.env.CLIENT_URL}/order/vnpay-return`;
                paymentUrl = VNPayUtil.createPaymentUrl(parentOrder._id.toString(), totalOrderAmount, ipAddr, returnUrl);
            }

            await session.commitTransaction();
            this._sendCheckoutNotifications(parentOrder, subOrdersToCreate, requestUser, totalOrderAmount);
            
            return {
                ...parentOrder.toObject ? parentOrder.toObject() : parentOrder,
                paymentUrl
            };

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    },

    /**
     * Xử lý VNPay Return (Redirect người dùng)
     */
    handleVNPayReturn: async (vnp_Params) => {
        const isValid = VNPayUtil.verifyReturnUrl({ ...vnp_Params });
        if (!isValid) return { success: false, orderId: vnp_Params['vnp_TxnRef'] };

        const responseCode = vnp_Params['vnp_ResponseCode'];
        return {
            success: responseCode === '00',
            orderId: vnp_Params['vnp_TxnRef']
        };
    },

    /**
     * Xử lý VNPay IPN (Webhook chính thức)
     * Senior BA: Phải check chữ ký, số tiền, trạng thái đơn hàng trước khi update
     */
    handleVNPayIPN: async (vnp_Params) => {
        const isValid = VNPayUtil.verifyReturnUrl({ ...vnp_Params });
        if (!isValid) return { RspCode: '97', Message: 'Fail checksum' };

        const orderId = vnp_Params['vnp_TxnRef'];
        const amount = parseInt(vnp_Params['vnp_Amount']) / 100;
        const responseCode = vnp_Params['vnp_ResponseCode'];

        const parentOrder = await ORDER_REPOSITORY.findParentById(orderId);
        if (!parentOrder) return { RspCode: '01', Message: 'Order not found' };
        if (parentOrder.totalAmount !== amount) return { RspCode: '04', Message: 'Invalid amount' };
        if (parentOrder.paymentStatus !== COMMON_CONSTANTS.PAYMENT_STATUS.PENDING) {
            return { RspCode: '02', Message: 'Order already confirmed' };
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            if (responseCode === '00') {
                // 1. Update Parent Order -> PAID
                await ORDER_REPOSITORY.updateParentPaymentStatus(orderId, COMMON_CONSTANTS.PAYMENT_STATUS.PAID, session);
                
                // 2. Update Sub Orders -> PAID
                await ORDER_REPOSITORY.updateSubsPaymentStatusByParentId(orderId, COMMON_CONSTANTS.PAYMENT_STATUS.PAID, session);

                // 3. Khởi tạo Escrow - Đóng băng tiền cho từng Shop
                const subOrders = await ORDER_REPOSITORY.findByParentId(orderId);
                for (const sub of subOrders) {
                    await WALLET_REPOSITORY.freezeBalance(sub.shopId, sub.netAmount, session);
                }

                await session.commitTransaction();
                return { RspCode: '00', Message: 'Success' };
            } else {
                // Thanh toán thất bại
                await ORDER_REPOSITORY.updateParentPaymentStatus(orderId, COMMON_CONSTANTS.PAYMENT_STATUS.FAILED, session);
                await ORDER_REPOSITORY.updateSubsPaymentStatusByParentId(orderId, COMMON_CONSTANTS.PAYMENT_STATUS.FAILED, session);
                
                await session.commitTransaction();
                return { RspCode: '00', Message: 'Success (Payment Failed logged)' };
            }
        } catch (error) {
            await session.abortTransaction();
            return { RspCode: '99', Message: 'Unknown error' };
        } finally {
            session.endSession();
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
            
            // Giải phóng kho (Deduce reservedStock - Don't restore stockQuantity)
            for (const item of subOrder.items) {
                await INVENTORY_REPOSITORY.releaseStock(
                    item.productId?._id || item.productId,
                    subOrder.branchId._id || subOrder.branchId,
                    item.quantity,
                    false
                );
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
    },

    /**
     * Tự động hủy các đơn hàng quá hạn thanh toán (Cron Job)
     */
    cancelExpiredOrders: async (minutesAgo = 20) => {
        const expiredOrders = await ORDER_REPOSITORY.findExpiredParents(minutesAgo);
        if (expiredOrders.length === 0) return;

        console.log(`[Job] Đang xử lý hủy ${expiredOrders.length} đơn hàng quá hạn...`);

        for (const order of expiredOrders) {
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                // 1. Update Parent -> FAILED
                await ORDER_REPOSITORY.updateParentPaymentStatus(order._id, COMMON_CONSTANTS.PAYMENT_STATUS.FAILED, session);
                
                // 2. Update Subs -> CANCELLED
                await ORDER_REPOSITORY.updateSubsPaymentStatusByParentId(order._id, COMMON_CONSTANTS.PAYMENT_STATUS.FAILED, session);
                const subOrders = await ORDER_REPOSITORY.findByParentId(order._id);
                
                for (const sub of subOrders) {
                    await ORDER_REPOSITORY.updateSubStatus(sub._id, COMMON_CONSTANTS.ORDER_STATUS.CANCELLED, session);
                    
                    // 3. Restore Stock
                    for (const item of sub.items) {
                        await INVENTORY_REPOSITORY.releaseStock(
                            item.productId?._id || item.productId,
                            sub.branchId._id || sub.branchId,
                            item.quantity,
                            true,
                            session
                        );
                    }

                    // 4. Restore Voucher (Sub-order level)
                    if (sub.appliedVoucherId) {
                        await VOUCHER_REPOSITORY.decrementUsedCount(sub.appliedVoucherId, session);
                    }
                }

                // 5. Restore Platform Vouchers (Parent level)
                // Note: Logic này tùy thuộc vào việc ParentOrder.appliedVouchers lưu ID hay Code. 
                // Ở đây assume ID hoặc cần findByCode.
                if (order.appliedVouchers && order.appliedVouchers.length > 0) {
                   for (const vCode of order.appliedVouchers) {
                      const v = await VOUCHER_REPOSITORY.findByCode(vCode);
                      if (v) await VOUCHER_REPOSITORY.decrementUsedCount(v._id, session);
                   }
                }

                await session.commitTransaction();
                console.log(`[Job] Đã hủy đơn hàng: ${order._id}`);
            } catch (error) {
                await session.abortTransaction();
                console.error(`[Job] Lỗi khi hủy đơn ${order._id}:`, error);
            } finally {
                session.endSession();
            }
        }
    }
};
