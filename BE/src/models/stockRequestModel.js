import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { COMMON_CONSTANTS } from '#constants/common.js';

const stockRequestSchema = new mongoose.Schema({
    requestNumber: { type: String, unique: true, required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Manager created this
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Owner/Admin approved this
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        name: String, // Snapshot for history
    }],
    status: {
        type: String,
        enum: Object.values(COMMON_CONSTANTS.STOCK_REQUEST_STATUS),
        default: COMMON_CONSTANTS.STOCK_REQUEST_STATUS.PENDING
    },
    notes: String,
    rejectionReason: String,
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Tự động tạo mã yêu cầu dạng REQ-YYYYMMDD-XXXX
stockRequestSchema.pre('validate', async function() {
    if (!this.requestNumber) {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.constructor.countDocuments({
            requestNumber: new RegExp(`REQ-${date}-`)
        });
        this.requestNumber = `REQ-${date}-${(count + 1).toString().padStart(4, '0')}`;
    }
});

stockRequestSchema.index({ shopId: 1, branchId: 1, status: 1 });
stockRequestSchema.plugin(mongoosePaginate);

export const StockRequest = mongoose.model('StockRequest', stockRequestSchema);
