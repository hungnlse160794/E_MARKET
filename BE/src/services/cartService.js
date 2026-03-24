import { CART_REPOSITORY } from '#repositories/cartRepository.js';
import { PRODUCT_REPOSITORY } from '#repositories/productRepository.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import ApiError from '#utils/ApiError.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';

export const cartService = {
    /**
     * Thêm sản phẩm vào giỏ hàng: Anti-Tampering & Security
     */
    addItemToCart: async (itemData, requestUser) => {
        const { productId, unitName, quantity } = itemData;

        // 1. Kiểm tra Sản phẩm tồn tại thực sự trong DB (BẢO MẬT: Không tin tưởng giá từ Client)
        const product = await PRODUCT_REPOSITORY.findById(productId);
        if (!product || product.status !== COMMON_CONSTANTS.PRODUCT_STATUS.AVAILABLE) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Sản phẩm hiện không khả dụng']);
        }

        // Tìm đơn vị tính khớp để lấy giá thực
        const unit = product.units.find(u => u.unitName === unitName);
        if (!unit) throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, [`Đơn vị tính ${unitName} không còn tồn tại cho sản phẩm này`]);

        const currentPrice = unit.price;

        let cart = await CART_REPOSITORY.findByUserId(requestUser.userId);

        // 2. Checklist: Limit kích thước giỏ hàng (chống DoS)
        if (cart && cart.items.length >= 100) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Giỏ hàng của bạn đã đầy (tối đa 100 món)']);
        }

        const newItem = {
            productId,
            shopId: product.shopId,
            branchId: itemData.branchId, // Chi nhánh do khách chọn
            unitName,
            quantity,
            price: currentPrice, // Dùng giá từ DB
            addedBy: requestUser.userId
        };

        if (!cart) {
            cart = await CART_REPOSITORY.create({
                ownerId: requestUser.userId,
                roomCode: GENERATE_UTILS.generateRoomCode(6),
                items: [newItem],
                members: []
            });
        } else {
            // Kiểm tra item đã có trong giỏ chưa
            const existingItemIndex = cart.items.findIndex(
                item => item.productId.toString() === productId.toString() &&
                    item.unitName === unitName
            );

            if (existingItemIndex > -1) {
                const newQuantity = cart.items[existingItemIndex].quantity + quantity;
                cart = await CART_REPOSITORY.updateItemQuantity(cart._id, cart.items[existingItemIndex]._id, newQuantity);
            } else {
                cart = await CART_REPOSITORY.addItem(cart._id, newItem);
            }
        }

        return cart;
    },

    getCart: async (requestUser) => {
        const cart = await CART_REPOSITORY.findByUserId(requestUser.userId);
        if (!cart) {
            return { items: [], totalAmount: 0 };
        }
        return cart;
    },

    updateItemQuantity: async (cartId, itemId, quantity, requestUser) => {
        const cart = await CART_REPOSITORY.findById(cartId);
        if (!cart) throw new ApiError(ERROR_CODES.RESOURCE_NOT_FOUND);

        // REFACTORED: Quyền sở hữu giỏ
        const isAuthorized = cart.ownerId.toString() === requestUser.userId.toString() ||
            cart.members.some(m => m.toString() === requestUser.userId.toString());

        if (!isAuthorized) throw new ApiError(ERROR_CODES.FORBIDDEN);

        return await CART_REPOSITORY.updateItemQuantity(cartId, itemId, quantity);
    },

    removeItem: async (cartId, itemId, requestUser) => {
        const cart = await CART_REPOSITORY.findById(cartId);
        if (!cart) throw new ApiError(ERROR_CODES.RESOURCE_NOT_FOUND);

        const isAuthorized = cart.ownerId.toString() === requestUser.userId.toString() ||
            cart.members.some(m => m.toString() === requestUser.userId.toString());

        if (!isAuthorized) throw new ApiError(ERROR_CODES.FORBIDDEN);

        return await CART_REPOSITORY.removeItem(cartId, itemId);
    },

    joinSharedCart: async (roomCode, requestUser) => {
        const cart = await CART_REPOSITORY.findByRoomCode(roomCode);
        if (!cart) throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Mã phòng không hợp lệ hoặc giỏ hàng đã đóng']);

        if (cart.ownerId.toString() === requestUser.userId.toString()) {
            return cart;
        }

        return await CART_REPOSITORY.addMember(cart._id, requestUser.userId);
    }
};
