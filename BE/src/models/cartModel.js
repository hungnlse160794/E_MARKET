import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    unitName: { type: String, required: true }, // VD: "Tô lớn"
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // Giá tại thời điểm thêm vào giỏ
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const sharedCartSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomCode: { type: String, unique: true, sparse: true }, // Mã để mời người khác vào giỏ (sparse để hỗ trợ giỏ cá nhân roomCode=null)
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    items: [cartItemSchema],
    status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'ABANDONED'], default: 'ACTIVE' }
}, { timestamps: true });

export const SharedCart = mongoose.model('SharedCart', sharedCartSchema);