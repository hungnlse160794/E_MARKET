import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { COMMON_CONSTANTS } from '#constants/common.js';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }, 
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true }, // Danh mục riêng của từng chi nhánh
    image: { type: String },
    order: { type: Number, default: 0 }, 
    status: {
        type: String,
        enum: Object.values(COMMON_CONSTANTS.CATEGORY_STATUS),
        default: COMMON_CONSTANTS.CATEGORY_STATUS.ACTIVE
    },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Index để danh mục là riêng biệt và duy nhất theo từng Chi nhánh
categorySchema.index({ branchId: 1, slug: 1 }, { unique: true });
categorySchema.index({ shopId: 1, branchId: 1 });
categorySchema.index({ parentId: 1 });

categorySchema.plugin(mongoosePaginate);

export const Category = mongoose.model('Category', categorySchema);