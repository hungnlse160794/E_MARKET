import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// --- Voucher ---
const voucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null }, // Null nếu là của Sàn
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null }, // Mới: Voucher gắn với chi nhánh cụ thể
    discountType: { type: String, enum: ['FIXED', 'PERCENTAGE'], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    startDate: Date,
    endDate: Date,
    usageLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người tạo ra voucher
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Index tối ưu cho truy vấn SaaS
voucherSchema.index({ shopId: 1, branchId: 1, code: 1 });
voucherSchema.index({ endDate: 1, isDeleted: 1 });

voucherSchema.plugin(mongoosePaginate);

export const Voucher = mongoose.model('Voucher', voucherSchema);