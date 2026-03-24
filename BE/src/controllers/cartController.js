import { catchAsync } from '#utils/catchAsync.js';
import { cartService } from '#services/cartService.js';

export const cartController = {
    addItemToCart: catchAsync(async (req, res) => {
        const result = await cartService.addItemToCart(req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'Thêm vào giỏ hàng thành công',
            data: result
        });
    }),

    getCart: catchAsync(async (req, res) => {
        const result = await cartService.getCart(req.user);
        res.status(200).json({
            success: true,
            message: 'Lấy thông tin giỏ hàng thành công',
            data: result
        });
    }),

    updateItemQuantity: catchAsync(async (req, res) => {
        const { cartId, itemId } = req.params;
        const result = await cartService.updateItemQuantity(cartId, itemId, req.body.quantity, req.user);
        res.status(200).json({
            success: true,
            message: 'Cập nhật số lượng sản phẩm thành công',
            data: result
        });
    }),

    removeItem: catchAsync(async (req, res) => {
        const { cartId, itemId } = req.params;
        const result = await cartService.removeItem(cartId, itemId, req.user);
        res.status(200).json({
            success: true,
            message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
            data: result
        });
    }),

    joinSharedCart: catchAsync(async (req, res) => {
        const result = await cartService.joinSharedCart(req.body.roomCode, req.user);
        res.status(200).json({
            success: true,
            message: 'Tham gia giỏ hàng chia sẻ thành công',
            data: result
        });
    })
};
