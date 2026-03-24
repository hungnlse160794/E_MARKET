import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
    // Mỗi ví có thể thuộc về Shop (để nhận tiền) hoặc User (để thanh toán)
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', sparse: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true, unique: true },
    
    balance: { type: Number, default: 0 }, // Số dư khả dụng
    frozenBalance: { type: Number, default: 0 }, // Tiền đang treo (Escrow) chờ đơn hàng hoàn tất hoặc xử lý rút
    currency: { type: String, default: 'VND' },
    status: { type: String, enum: ['ACTIVE', 'LOCKED'], default: 'ACTIVE' }
}, { timestamps: true });

// Ràng buộc: Một ví phải thuộc về Shop hoặc User, không được để trống cả 2
walletSchema.pre('save', function(next) {
    if (!this.shopId && !this.userId) {
        return next(new Error('Wallet must belong to either a Shop or a User'));
    }
    next();
});

export const Wallet = mongoose.model('Wallet', walletSchema);