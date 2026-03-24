import { SharedCart } from '#models/index.js';

export const CART_REPOSITORY = {
    create: async (cartData) => {
        const cart = new SharedCart(cartData);
        return await cart.save();
    },

    findById: async (id) => {
        return await SharedCart.findById(id).populate('members items.productId').lean();
    },

    findByOwnerId: async (ownerId) => {
        return await SharedCart.findOne({ ownerId, status: 'ACTIVE' }).populate('items.productId').lean();
    },

    findByRoomCode: async (roomCode) => {
        return await SharedCart.findOne({ roomCode, status: 'ACTIVE' }).populate('members items.productId').lean();
    },

    findByUserId: async (userId) => {
        // Tìm giỏ hàng mà user là chủ sở hữu hoặc là thành viên
        return await SharedCart.findOne({
            $or: [{ ownerId: userId }, { members: userId }],
            status: 'ACTIVE'
        }).populate('items.productId').lean();
    },

    update: async (id, updateData) => {
        return await SharedCart.findByIdAndUpdate(id, updateData, { new: true }).populate('items.productId').lean();
    },

    deleteById: async (id) => {
        return await SharedCart.findByIdAndDelete(id).lean();
    },

    addItem: async (cartId, itemData) => {
        return await SharedCart.findByIdAndUpdate(
            cartId,
            { $push: { items: itemData } },
            { new: true }
        ).populate('items.productId').lean();
    },

    updateItemQuantity: async (cartId, itemId, quantity) => {
        return await SharedCart.findOneAndUpdate(
            { _id: cartId, 'items._id': itemId },
            { $set: { 'items.$.quantity': quantity } },
            { new: true }
        ).populate('items.productId').lean();
    },

    removeItem: async (cartId, itemId) => {
        return await SharedCart.findByIdAndUpdate(
            cartId,
            { $pull: { items: { _id: itemId } } },
            { new: true }
        ).populate('items.productId').lean();
    },

    addMember: async (cartId, userId) => {
        return await SharedCart.findByIdAndUpdate(
            cartId,
            { $addToSet: { members: userId } },
            { new: true }
        ).populate('members').lean();
    }
};
