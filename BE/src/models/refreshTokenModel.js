import mongoose from 'mongoose'

const refreshTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    isRevoked: { type: Boolean, default: false } // Đánh dấu true nếu admin/user chủ động ban thiết bị này
}, { timestamps: true })

// Tự động xóa document khi hết hạn (TTL Index)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema)