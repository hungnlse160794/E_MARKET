import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { COMMON_CONSTANTS } from '#constants/common.js';

// --- 9.1 Parent Order (Đơn tổng) ---
const parentOrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { 
        type: String, 
        enum: Object.values(COMMON_CONSTANTS.PAYMENT_METHOD), 
        required: true 
    },
    paymentStatus: { 
        type: String, 
        enum: Object.values(COMMON_CONSTANTS.PAYMENT_STATUS), 
        default: COMMON_CONSTANTS.PAYMENT_STATUS.PENDING 
    },
    shippingAddress: { type: Object, required: true },
    appliedVouchers: [{ type: String }], // Lưu danh sách mã đã dùng
    note: String,
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// --- 9.2 Sub Order (Đơn con cho từng Shop) ---
const subOrderSchema = new mongoose.Schema({
    parentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParentOrder', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    items: [{
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        unitName: String,
        unitNameSnapshot: String, // Snapshot cho BA Audit
        price: Number,
        priceAtPurchase: Number,   // Snapshot giá tại thời điểm đặt hàng
        quantity: Number
    }],
    subTotal: { type: Number, required: true },
    platformFee: { type: Number, required: true }, // Phí sàn thu của shop này
    netAmount: { type: Number, required: true },   // Tiền thực nhận của shop (sau khi trừ phí)
    appliedVoucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' }, // Voucher của shop này
    status: {
        type: String,
        enum: Object.values(COMMON_CONSTANTS.ORDER_STATUS),
        default: COMMON_CONSTANTS.ORDER_STATUS.PENDING
    },
    trackingNumber: String,
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Index tối ưu cho truy vấn của Shop và Branch (SaaS Model)
subOrderSchema.index({ shopId: 1, createdAt: -1 });
subOrderSchema.index({ branchId: 1, status: 1 });

parentOrderSchema.plugin(mongoosePaginate);
subOrderSchema.plugin(mongoosePaginate);

export const ParentOrder = mongoose.model('ParentOrder', parentOrderSchema);
export const SubOrder = mongoose.model('SubOrder', subOrderSchema);