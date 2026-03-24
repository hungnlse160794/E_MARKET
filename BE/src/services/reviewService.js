import { REVIEW_REPOSITORY } from '#repositories/reviewRepository.js';
import { ORDER_REPOSITORY } from '#repositories/orderRepository.js';
import { PRODUCT_REPOSITORY } from '#repositories/productRepository.js';
import { SHOP_REPOSITORY } from '#repositories/shopRepository.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import ApiError from '#utils/ApiError.js';

export const reviewService = {
    createReview: async (reviewData, requestUser) => {
        const { subOrderId, productId, shopId, rating } = reviewData;

        // 1. Kiểm tra đơn hàng có tồn tại và thuộc về user không
        const subOrder = await ORDER_REPOSITORY.findSubById(subOrderId);
        if (!subOrder) throw new ApiError(ERROR_CODES.ORDER_NOT_FOUND);

        // SubOrder -> ParentOrder -> userId
        if (subOrder.parentOrderId.userId.toString() !== requestUser.userId.toString()) {
            throw new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn chỉ có thể đánh giá đơn hàng của chính mình']);
        }

        // 2. Kiểm tra xem đơn đã hoàn thành chưa mới được đánh giá
        if (subOrder.status !== COMMON_CONSTANTS.ORDER_STATUS.DELIVERED) {
             throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Chỉ có thể đánh giá khi đơn hàng đã giao thành công']);
        }

        // 3. Kiểm tra xem đã đánh giá đơn này chưa
        const existingReview = await REVIEW_REPOSITORY.checkExists(requestUser.userId, subOrderId);
        if (existingReview) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Bạn đã đánh giá đơn hàng này rồi']);
        }

        // 4. Lưu đánh giá
        const newReview = await REVIEW_REPOSITORY.create({
            ...reviewData,
            userId: requestUser.userId
        });

        // 5. Cập nhật Rating trung bình (Background sync - hoặc await trực tiếp cho chính xác)
        // Cập nhật cho Sản phẩm
        const productStats = await REVIEW_REPOSITORY.getAverageRating({ productId: subOrder.items[0].productId }); // Giả định đánh giá sp đầu tiên hoặc cả đơn
        // Lưu ý: Logic thực tế có thể lặp qua subOrder.items nếu mảng items có nhiều SP
        await PRODUCT_REPOSITORY.updateById(productId, {
            ratingsAverage: productStats.averageRating,
            ratingsQuantity: productStats.reviewCount
        });

        // Cập nhật cho Shop
        const shopStats = await REVIEW_REPOSITORY.getAverageRating({ shopId });
        await SHOP_REPOSITORY.update(shopId, {
            rating: shopStats.averageRating
        });

        return newReview;
    },

    getProductReviews: async (productId, options) => {
        return await REVIEW_REPOSITORY.findByProduct(productId, options);
    },

    getShopReviews: async (shopId, options) => {
        return await REVIEW_REPOSITORY.findByShop(shopId, options);
    }
};
