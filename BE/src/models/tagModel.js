import mongoose from 'mongoose'

export const Tag = mongoose.model('Tag', new mongoose.Schema({
    name: { type: String, required: true, unique: true }
}, { timestamps: true }))

export const TagProduct = mongoose.model('TagProduct', new mongoose.Schema({
    tagId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
}, { timestamps: true }))