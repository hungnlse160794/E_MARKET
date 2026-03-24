import mongoose from 'mongoose'

const inventorySchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    stockQuantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 }, // Ngưỡng cảnh báo tồn kho thấp
    reservedStock: { type: Number, default: 0 }, // Khoá tạm khi khách đang thanh toán
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true })

inventorySchema.index({ productId: 1, branchId: 1, isDeleted: 1 }, { unique: true })

export const Inventory = mongoose.model('Inventory', inventorySchema)