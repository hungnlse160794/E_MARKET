import { Category } from '#models/categoryModel.js';
import { Product } from '#models/productModel.js';

export const CATEGORY_REPOSITORY = {
    create: async (categoryData) => {
        const category = new Category(categoryData);
        return await category.save();
    },

    findAll: async () => {
        return await Category.find({ isDeleted: false }).sort({ order: 1 }).lean();
    },

    findById: async (id) => {
        return await Category.findOne({ _id: id, isDeleted: false })
            .populate('parentId', 'name')
            .lean();
    },

    findByBranchId: async (branchId) => {
        return await Category.find({ branchId, isDeleted: false })
            .sort({ order: 1 })
            .populate('parentId', 'name')
            .lean();
    },

    findBySlugAndBranch: async (slug, branchId) => {
        return await Category.findOne({ slug, branchId, isDeleted: false }).lean();
    },

    findChildren: async (parentId) => {
        return await Category.find({ parentId, isDeleted: false }).lean();
    },

    countProductsByCategory: async (categoryId) => {
        return await Product.countDocuments({ categoryId, isDeleted: false });
    },

    update: async (id, updateData) => {
        return await Category.findOneAndUpdate(
            { _id: id, isDeleted: false }, 
            updateData, 
            { new: true }
        ).lean();
    },

    deleteById: async (id) => {
        return await Category.findByIdAndRemove(id);
    },

    softDeleteById: async (id) => {
        return await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean();
    }
};
