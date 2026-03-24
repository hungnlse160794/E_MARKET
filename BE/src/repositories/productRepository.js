import mongoose from 'mongoose';
import { Product } from '#models/productModel.js';

export const PRODUCT_REPOSITORY = {
    create: async (productData) => {
        const product = new Product(productData);
        return await product.save();
    },

    findById: async (productId) => {
        return await Product.findOne({ _id: productId, isDeleted: { $ne: true } })
            .populate([
                { path: 'shopId', select: 'name logo' },
                { path: 'branchId', select: 'branchName address contactPhone' },
                { path: 'categoryId', select: 'name' }
            ])
            .lean();
    },

    findBySlug: async (slug) => {
        return await Product.findOne({ slug, isDeleted: { $ne: true } }).lean();
    },

    findByIdOrSlug: async (idOrSlug) => {
        const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
        const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
        query.isDeleted = { $ne: true };

        return await Product.findOne(query)
            .populate([
                { path: 'shopId', select: 'name logo' },
                { path: 'branchId', select: 'branchName address contactPhone' },
                { path: 'categoryId', select: 'name' }
            ])
            .lean();
    },

    paginateByBranchId: async (branchId, options, filters = {}) => {
        return await PRODUCT_REPOSITORY.paginateGlobal(options, { ...filters, branchId });
    },

    paginateGlobal: async (options, filters = {}) => {
        // console.log('DEBUG: paginateGlobal filters:', filters);
        const query = { isDeleted: { $ne: true } };

        // 0. Optional Branch filter
        if (filters.branchId) {
            query.branchId = filters.branchId;
        }

        // 1. Keyword search (Name or Description)
        if (filters.search && filters.search.trim() !== '') {
             query.name = { $regex: filters.search.trim(), $options: 'i' };
        }

        // 2. Category filtering - Ensure valid ID
        if (filters.category && filters.category !== 'all') {
            query.categoryId = filters.category;
        }

        // 3. Status filtering
        if (filters.status) {
            query.status = filters.status;
        } else {
             // For public view, we exclude HIDDEN but include AVAILABLE and OUT_OF_STOCK
             query.status = { $ne: 'HIDDEN' };
        }

        // 4. Price range filtering - Robust number parsing
        const minPrice = filters.minPrice ? Number(filters.minPrice) : null;
        const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;

        if (minPrice !== null || maxPrice !== null) {
            const priceQuery = {};
            if (minPrice !== null && !isNaN(minPrice)) priceQuery.$gte = minPrice;
            if (maxPrice !== null && !isNaN(maxPrice)) priceQuery.$lte = maxPrice;

            if (Object.keys(priceQuery).length > 0) {
                query['units.price'] = priceQuery;
            }
        }

        // 5. Rating filtering
        if (typeof filters.rating === 'number') {
            query.ratingsAverage = { $gte: filters.rating };
        }

        // 6. Sorting logic
        let sort = { createdAt: -1 }; // Default: newest
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'price-asc':
                    sort = { 'units.price': 1 };
                    break;
                case 'price-desc':
                    sort = { 'units.price': -1 };
                    break;
                case 'rating-desc':
                    sort = { ratingsAverage: -1 };
                    break;
                case 'newest':
                default:
                    sort = { createdAt: -1 };
                    break;
            }
        }

        // 7. Ensure population and sorting
        const paginationOptions = {
            ...options,
            sort: options.sort || sort,
            populate: [
                { path: 'shopId', select: 'name logo' },
                { path: 'branchId', select: 'branchName address contactPhone' },
                { path: 'categoryId', select: 'name' }
            ],
            lean: true
        };

        return await Product.paginate(query, paginationOptions);
    },

    updateById: async (productId, updateData) => {
        return await Product.findOneAndUpdate(
            { _id: productId, isDeleted: false },
            updateData,
            { new: true, runValidators: true }
        )
            .populate([
                { path: 'shopId', select: 'name logo' },
                { path: 'branchId', select: 'branchName address contactPhone' },
                { path: 'categoryId', select: 'name' }
            ])
            .lean();
    },

    deleteById: async (productId) => {
        // Chuyển sang Soft Delete
        return await Product.findByIdAndUpdate(productId, { isDeleted: true }, { new: true }).lean();
    },

    findByBranchAndSlug: async (branchId, slug) => {
        return await Product.findOne({ branchId, slug, isDeleted: false }).lean();
    }
};
