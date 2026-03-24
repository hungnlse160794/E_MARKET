import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { COMMON_CONSTANTS } from '#constants/common.js';

const blogSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    thumbnail: { type: String, default: '' },
    summary: { type: String, maxLength: 500 },
    contentHTML: { type: String, required: true },
    status: {
        type: String,
        enum: ['PUBLISHED', 'DRAFT', 'HIDDEN'],
        default: 'PUBLISHED'
    },
    tags: [{ type: String, trim: true }],
    viewCount: { type: Number, default: 0 },
    seoMeta: {
        title: String,
        description: String,
        keywords: [String]
    }
}, { timestamps: true });

blogSchema.plugin(mongoosePaginate);

// Index cho tìm kiếm slug và lọc theo shop
blogSchema.index({ shopId: 1, status: 1 });
blogSchema.index({ slug: 1 });

export const Blog = mongoose.model('Blog', blogSchema);