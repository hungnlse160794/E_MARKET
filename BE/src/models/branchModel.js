import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const branchSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    branchName: { type: String, required: true }, // CN Dĩ An, CN Thuận An
    address: {
        province: String,
        district: String,
        ward: String,
        street: String,
        fullAddress: String
    },
    // Tọa độ GPS để tính khoảng cách (GeoJSON chuẩn MongoDB)
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' } // [kinh độ, vĩ độ]
    },
    contactPhone: String,
    isOpen: { type: Boolean, default: true },
    workingHours: {
        open: String, // "08:00"
        close: String // "22:00"
    },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Index để tìm kiếm theo bán kính cực nhanh
branchSchema.index({ location: '2dsphere' });

branchSchema.plugin(mongoosePaginate);

export const Branch = mongoose.model('Branch', branchSchema);