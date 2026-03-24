import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Có thể là UserId hoặc BranchId
    ownerType: { type: String, enum: ['USER', 'BRANCH'], required: true },
    provinceCode: { type: String, required: true },
    districtCode: { type: String, required: true },
    wardCode: { type: String, required: true },
    street: { type: String, required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
    },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true })

export const Address = mongoose.model('Address', addressSchema)