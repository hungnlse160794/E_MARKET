import { REVIEW_REPOSITORY } from '#repositories/reviewRepository.js';
import { ORDER_REPOSITORY } from '#repositories/orderRepository.js';
import { PRODUCT_REPOSITORY } from '#repositories/productRepository.js';
import { SHOP_REPOSITORY } from '#repositories/shopRepository.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import ApiError from '#utils/ApiError.js';

export const reviewService = {
    createReview: async (reviewData, requestUser) => {
        const { subOrderId, productId, rating, comment, images } = reviewData;

        // 1. Bảo mật: Kiểm tra đơn hàng tồn tại và thuộc quyền sở hữu của user
        const subOrder = await ORDER_REPOSITORY.findSubById(subOrderId);
        if (!subOrder) throw new ApiError(ERROR_CODES.ORDER_NOT_FOUND);

        // Kiểm tra quyền sở hữu gián tiếp qua ParentOrder
        if (subOrder.parentOrderId.userId.toString() !== requestUser.userId.toString()) {
            throw new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền đánh giá đơn hàng này']);
        }

        // 2. Nghiệp vụ: Kiểm tra trạng thái đơn hàng (Phải đã giao mới được đánh giá)
        if (subOrder.status !== COMMON_CONSTANTS.ORDER_STATUS.DELIVERED) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Bạn chỉ có thể đánh giá sau khi đã nhận được hàng']);
        }

        // 3. Nghiệp vụ: Kiểm tra Sản phẩm có nằm trong đơn hàng này không
        const productInOrder = subOrder.items.find(item => item.productId.toString() === productId.toString());
        if (!productInOrder) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Sản phẩm này không nằm trong đơn hàng của bạn']);
        }

        // 4. Chống Spam: Một user chỉ được đánh giá 1 lần cho 1 sản phẩm trong 1 đơn hàng
        const existingReview = await REVIEW_REPOSITORY.checkExists(requestUser.userId, subOrderId, productId);
        if (existingReview) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Bạn đã gửi đánh giá cho sản phẩm này trong đơn hàng này rồi']);
        }

        // 5. Tạo Review
        const newReview = await REVIEW_REPOSITORY.create({
            userId: requestUser.userId,
            subOrderId,
            productId,
            shopId: subOrder.shopId,
            rating,
            comment,
            images: images || [],
            status: 'PUBLISHED'
        });

        // 6. Cập nhật chỉ số tín nhiệm (Rating) cho Sản phẩm & Shop
        // Lưu ý: Sử dụng cơ chế async để không làm chậm response của khách
        this._updateRatings(productId, subOrder.shopId);

        return newReview;
    },

    /**
     * Cập nhật Rating trung bình (Internal)
     */
    _updateRatings: async (productId, shopId) => {
        try {
            // Cập nhật Sản phẩm
            const productStats = await REVIEW_REPOSITORY.getAverageRating({ productId });
            if (productStats) {
                await PRODUCT_REPOSITORY.updateById(productId, {
                    ratingsAverage: productStats.averageRating,
                    ratingsQuantity: productStats.reviewCount
                });
            }

            // Cập nhật Shop
            const shopStats = await REVIEW_REPOSITORY.getAverageRating({ shopId });
            if (shopStats) {
                await SHOP_REPOSITORY.update(shopId, {
                    rating: shopStats.averageRating
                });
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật Rating:', error);
        }
    },

    getProductReviews: async (productId, options) => {
        return await REVIEW_REPOSITORY.findByProduct(productId, options);
    },

    getShopReviews: async (shopId, options) => {
        return await REVIEW_REPOSITORY.findByShop(shopId, options);
    }
};
