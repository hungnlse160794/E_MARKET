import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { COMMON_CONSTANTS } from '#constants/common.js';

const shopSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true }, // bún-bò-chú-6
    logo: { type: String },
    banner: { type: String },
    description: { type: String },
    category: { type: String, enum: Object.values(COMMON_CONSTANTS.SHOP_CATEGORY) },

    // SaaS Logic: Phí sàn áp dụng riêng cho từng shop
    commissionRate: { type: Number, default: 10 }, // 10%

    rating: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    status: {
        type: String,
        enum: Object.values(COMMON_CONSTANTS.SHOP_STATUS),
        default: COMMON_CONSTANTS.SHOP_STATUS.PENDING
    },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

shopSchema.plugin(mongoosePaginate);

export const Shop = mongoose.model('Shop', shopSchema);