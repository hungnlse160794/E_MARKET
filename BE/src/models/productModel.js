import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { COMMON_CONSTANTS } from '#constants/common.js';

const productSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true }, // VD: tra-sua-tran-chau
    description: { type: String },
    images: [{ type: String }], // Mảng URL ảnh từ Cloudinary

    // Logic đa đơn vị tính (UoM)
    units: [{
        unitName: { type: String, required: true }, // VD: Ly nhỏ, Ly lớn, Tô
        price: { type: Number, required: true },
        isDefault: { type: Boolean, default: false }
    }],

    // Thuộc tính phục vụ đồ ăn (Topping/Options)
    options: [{
        name: { type: String }, // VD: Thêm trứng, Thêm chả
        price: { type: Number }
    }],

    status: { 
        type: String, 
        enum: Object.values(COMMON_CONSTANTS.PRODUCT_STATUS), 
        default: COMMON_CONSTANTS.PRODUCT_STATUS.AVAILABLE 
    },
    tags: [{ type: String, trim: true }], // VD: #banchay, #monmoi
    ratingsAverage: { type: Number, default: 0 },
    ratingsQuantity: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Index để tìm kiếm sản phẩm và lọc nhanh hơn
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ branchId: 1, categoryId: 1, status: 1 });
productSchema.index({ shopId: 1, branchId: 1 });
productSchema.index({ branchId: 1, slug: 1 }, { unique: true }); // Slug duy nhất trong cùng 1 chi nhánh

productSchema.plugin(mongoosePaginate);

export const Product = mongoose.model('Product', productSchema);