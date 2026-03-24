import { catchAsync } from '#utils/catchAsync.js';
import { reviewService } from '#services/reviewService.js';

export const reviewController = {
    createReview: catchAsync(async (req, res) => {
        const result = await reviewService.createReview(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'Đánh giá thành công! Cảm ơn bạn đã đóng góp ý kiến.',
            data: result
        });
    }),

    getProductReviews: catchAsync(async (req, res) => {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const result = await reviewService.getProductReviews(productId, { page, limit });
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách đánh giá sản phẩm thành công',
            data: result
        });
    }),

    getShopReviews: catchAsync(async (req, res) => {
        const { shopId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const result = await reviewService.getShopReviews(shopId, { page, limit });
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách đánh giá gian hàng thành công',
            data: result
        });
    })
};
