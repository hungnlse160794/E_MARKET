import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// --- Voucher ---
const voucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null }, // Null nếu là của Sàn
    discountType: { type: String, enum: ['FIXED', 'PERCENTAGE'], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    startDate: Date,
    endDate: Date,
    usageLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

voucherSchema.plugin(mongoosePaginate);

export const Voucher = mongoose.model('Voucher', voucherSchema);