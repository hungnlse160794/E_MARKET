import { Product } from '#models/productModel.js';

export const PRODUCT_REPOSITORY = {
    create: async (productData) => {
        const product = new Product(productData);
        return await product.save();
    },

    findById: async (productId) => {
        return await Product.findOne({ _id: productId, isDeleted: false })
            .populate([
                { path: 'shopId', select: 'name logo' },
                { path: 'branchId', select: 'branchName address contactPhone' },
                { path: 'categoryId', select: 'name' }
            ])
            .lean();
    },

    paginateByBranchId: async (branchId, options, filters = {}) => {
        const query = { branchId, isDeleted: false };

        // 1. Keyword search (Name or Description)
        if (filters.search) {
            query.$text = { $search: filters.search };
        }

        // 2. Category filtering
        if (filters.category) {
            query.categoryId = filters.category;
        }

        // 3. Status filtering
        if (filters.status) {
            query.status = filters.status;
        }

        // 4. Price range filtering
        if (typeof filters.minPrice === 'number' || typeof filters.maxPrice === 'number') {
            const priceQuery = {};
            if (typeof filters.minPrice === 'number') priceQuery.$gte = filters.minPrice;
            if (typeof filters.maxPrice === 'number') priceQuery.$lte = filters.maxPrice;

            // Check in units price since price is under units
            query['units.price'] = priceQuery;
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
