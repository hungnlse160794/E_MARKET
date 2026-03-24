import { Branch } from '#models/branchModel.js';

export const BRANCH_REPOSITORY = {
    create: async (branchData) => {
        const branch = new Branch(branchData);
        return await branch.save();
    },

    findById: async (id) => {
        return await Branch.findOne({ _id: id, isDeleted: false }).lean();
    },

    findByShopId: async (shopId) => {
        return await Branch.find({ shopId, isDeleted: false }).lean();
    },

    update: async (id, updateData) => {
        return await Branch.findOneAndUpdate(
            { _id: id, isDeleted: false }, 
            updateData, 
            { new: true }
        ).lean();
    },

    deleteById: async (id) => {
        return await Branch.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean();
    },

    /**
     * Tìm các chi nhánh gần tọa độ GPS (SaaS Location Search)
     */
    findNear: async (longitude, latitude, maxDistanceKm = 5) => {
        return await Branch.find({
            isDeleted: false,
            isOpen: true,
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [longitude, latitude] },
                    $maxDistance: maxDistanceKm * 1000 // mét
                }
            }
        }).lean();
    }
};
