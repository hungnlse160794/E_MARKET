import { Shop } from '#models/shopModel.js';

export const SHOP_REPOSITORY = {
    create: async (shopData) => {
        const newShop = new Shop(shopData);
        return await newShop.save();
    },

    findByOwnerId: async (ownerId) => {
        return await Shop.find({ ownerId, isDeleted: false }).lean();
    },

    findById: async (id) => {
        return await Shop.findOne({ _id: id, isDeleted: false }).lean();
    },

    findByName: async (name) => {
        return await Shop.findOne({ name, isDeleted: false }).lean();
    },

    update: async (id, updateData) => {
        return await Shop.findOneAndUpdate(
            { _id: id, isDeleted: false },
            updateData,
            { new: true }
        ).lean();
    },

    deleteById: async (id) => {
        return await Shop.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean();
    }
};
