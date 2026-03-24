import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { COMMON_CONSTANTS } from '#constants/common.js';

const transactionSchema = new mongoose.Schema({
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: Object.values(COMMON_CONSTANTS.TRANSACTION_TYPE),
        required: true
    },
    status: { 
        type: String, 
        enum: Object.values(COMMON_CONSTANTS.TRANSACTION_STATUS), 
        default: COMMON_CONSTANTS.TRANSACTION_STATUS.PENDING 
    },
    description: { type: String },
    referenceId: { type: mongoose.Schema.Types.ObjectId }, // ID của Đơn hàng hoặc Lệnh rút tiền
    metadata: { type: Object } // Lưu thêm thông tin phụ nếu cần
}, { timestamps: true });

transactionSchema.plugin(mongoosePaginate);

export const Transaction = mongoose.model('Transaction', transactionSchema);