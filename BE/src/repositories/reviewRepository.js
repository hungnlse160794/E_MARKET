import { Review } from '#models/reviewSchema.js';

export const REVIEW_REPOSITORY = {
    create: async (reviewData) => {
        const review = new Review(reviewData);
        return await review.save();
    },

    findById: async (id) => {
        return await Review.findById(id).populate('userId', 'fullName avatar email').lean();
    },

    deleteById: async (id) => {
        return await Review.findByIdAndDelete(id);
    },

    findByProduct: async (productId, options = {}) => {
        const { page = 1, limit = 10 } = options;
        return await Review.paginate(
            { productId },
            { 
                page, 
                limit, 
                sort: { createdAt: -1 },
                populate: { path: 'userId', select: 'fullName avatar' }
            }
        );
    },

    findByShop: async (shopId, options = {}) => {
        const { page = 1, limit = 10 } = options;
        return await Review.paginate(
            { shopId },
            { 
                page, 
                limit, 
                sort: { createdAt: -1 },
                populate: [
                    { path: 'userId', select: 'fullName avatar' },
                    { path: 'productId', select: 'name image' }
                ]
            }
        );
    },

    /**
     * Tính toán Rating trung bình của Sản phẩm hoặc Shop
     */
    getAverageRating: async (filter = {}) => {
        const stats = await Review.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 }
                }
            }
        ]);
        return stats[0] || { averageRating: 0, reviewCount: 0 };
    },

    checkExists: async (userId, subOrderId) => {
        return await Review.findOne({ userId, subOrderId }).lean();
    }
};
