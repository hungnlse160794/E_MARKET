import mongoose from 'mongoose'

const mediaAssetSchema = new mongoose.Schema({
    uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: ['Cloudflare', 'S3', 'Cloudinary'], default: 'Cloudflare' },
    providerId: { type: String, required: true }, // ID từ bên thứ 3 để delete
    publicUrl: { type: String, required: true },
    assetType: { type: String, enum: ['IMAGE', 'VIDEO', 'FILE'], default: 'IMAGE' },
    isInUse: { type: Boolean, default: true }
}, { timestamps: true })

export const MediaAsset = mongoose.model('MediaAsset', mediaAssetSchema)