import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    subOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    images: [String]
}, { timestamps: true });

reviewSchema.plugin(mongoosePaginate);

export const Review = mongoose.model('Review', reviewSchema);