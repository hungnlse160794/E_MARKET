import mongoose from 'mongoose'

const inventoryLogSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ai là người cập nhật
    type: { 
        type: String, 
        enum: ['ADD', 'SUBTRACT', 'SET', 'ORDER_RESERVE', 'ORDER_RELEASE', 'ORDER_COMPLETE'], 
        required: true 
    },
    quantity: { type: Number, required: true }, // Số lượng thay đổi
    oldQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    note: { type: String }
}, { timestamps: true })

inventoryLogSchema.index({ productId: 1, branchId: 1 })
inventoryLogSchema.index({ userId: 1 })
inventoryLogSchema.index({ createdAt: -1 })

export const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema)
