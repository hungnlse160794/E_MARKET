import { Inventory } from '#models/inventoryModel.js';

export const INVENTORY_REPOSITORY = {
    /**
     * Khởi tạo hoặc cập nhật số lượng tồn kho cho một chi nhánh
     * Dùng upsert để tự động tạo bản ghi nếu chưa có
     */
    updateStock: async (productId, branchId, amount, session = null) => {
        return await Inventory.findOneAndUpdate(
            { productId, branchId, isDeleted: false },
            { $inc: { stockQuantity: amount } },
            { upsert: true, new: true, session }
        ).lean();
    },

    /**
     * Tạm khóa kho (Reserved Stock) khi khách hàng bấm đặt hàng
     * Tránh tình trạng Overselling (Selling more than available)
     */
    reserveStock: async (productId, branchId, amount, session = null) => {
        // Chỉ trừ stockQuantity nếu stockQuantity >= amount
        return await Inventory.findOneAndUpdate(
            { 
                productId, 
                branchId, 
                stockQuantity: { $gte: amount },
                isDeleted: false
            },
            { 
                $inc: { 
                    stockQuantity: -amount,
                    reservedStock: amount 
                } 
            },
            { new: true, session }
        ).lean();
    },

    /**
     * Giải phóng kho tạm (Từ Reserved sang Trừ hẳn hoặc Trả lại)
     * Thường dùng khi đơn hàng bị hủy hoặc thanh toán không thành công
     */
    releaseStock: async (productId, branchId, amount, isRestore = true, session = null) => {
        const update = isRestore 
            ? { $inc: { stockQuantity: amount, reservedStock: -amount } } // Trả lại kho
            : { $inc: { reservedStock: -amount } }; // Trừ hẳn khỏi reserved (đơn đã xong)

        return await Inventory.findOneAndUpdate(
            { productId, branchId, reservedStock: { $gte: amount }, isDeleted: false },
            update,
            { new: true, session }
        ).lean();
    },

    findByBranchAndProduct: async (productId, branchId, session = null) => {
        return await Inventory.findOne({ productId, branchId, isDeleted: false }, null, { session }).lean();
    },

    findByProduct: async (productId) => {
        return await Inventory.find({ productId, isDeleted: false }).populate('branchId', 'name address').lean();
    },

    findByBranch: async (branchId) => {
        return await Inventory.find({ branchId, isDeleted: false })
            .populate('productId', 'name images units status slug')
            .lean();
    },

    findByShop: async (shopId) => {
        const mongoose = await import('mongoose');
        const shopObjectId = new mongoose.default.Types.ObjectId(shopId);

        const results = await Inventory.aggregate([
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branchId',
                    foreignField: '_id',
                    as: 'branchInfo'
                }
            },
            { $unwind: '$branchInfo' },
            {
                $match: {
                    'branchInfo.shopId': shopObjectId,
                    'isDeleted': false
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    _id: 1,
                    branchId: '$branchInfo',
                    productId: {
                        _id: '$productInfo._id',
                        name: '$productInfo.name',
                        images: '$productInfo.images',
                        units: '$productInfo.units',
                        status: '$productInfo.status',
                        slug: '$productInfo.slug'
                    },
                    stockQuantity: 1,
                    lowStockThreshold: 1,
                    reservedStock: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        return results.map(item => ({
            ...item,
            _id: item._id.toString(),
            productId: { ...item.productId, _id: item.productId._id.toString() },
            branchId: { ...item.branchId, _id: item.branchId._id.toString() }
        }));
    },

    getLowStockByShop: async (shopId) => {
        const mongoose = await import('mongoose');
        const shopObjectId = new mongoose.default.Types.ObjectId(shopId);

        const results = await Inventory.aggregate([
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branchId',
                    foreignField: '_id',
                    as: 'branchInfo'
                }
            },
            { $unwind: '$branchInfo' },
            {
                $match: {
                    'branchInfo.shopId': shopObjectId,
                    'isDeleted': false,
                    $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    _id: 1,
                    branchId: '$branchInfo',
                    productId: {
                        _id: '$productInfo._id',
                        name: '$productInfo.name',
                        images: '$productInfo.images',
                        units: '$productInfo.units',
                        status: '$productInfo.status',
                        slug: '$productInfo.slug'
                    },
                    stockQuantity: 1,
                    lowStockThreshold: 1,
                    reservedStock: 1
                }
            }
        ]);

        return results.map(item => ({
            ...item,
            _id: item._id.toString(),
            productId: { ...item.productId, _id: item.productId._id.toString() },
            branchId: { ...item.branchId, _id: item.branchId._id.toString() }
        }));
    },

    getHistoryByShop: async (shopId) => {
        const mongoose = await import('mongoose');
        const shopObjectId = new mongoose.default.Types.ObjectId(shopId);
        const { InventoryLog } = await import('#models/inventoryLogModel.js');

        const results = await InventoryLog.aggregate([
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branchId',
                    foreignField: '_id',
                    as: 'branchInfo'
                }
            },
            { $unwind: '$branchInfo' },
            { $match: { 'branchInfo.shopId': shopObjectId } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            { $sort: { createdAt: -1 } },
            { $limit: 100 },
            {
                $project: {
                    _id: 1,
                    type: 1,
                    quantity: 1,
                    oldQuantity: 1,
                    newQuantity: 1,
                    note: 1,
                    createdAt: 1,
                    productId: {
                        _id: '$productInfo._id',
                        name: '$productInfo.name'
                    },
                    branchId: '$branchInfo',
                    userId: '$userInfo'
                }
            }
        ]);

        return results.map(item => ({
            ...item,
            _id: item._id.toString(),
            productId: { ...item.productId, _id: item.productId._id.toString() },
            branchId: { ...item.branchId, _id: item.branchId._id.toString() },
            userId: { ...item.userId, _id: item.userId._id.toString() }
        }));
    },

    /**
     * Lấy các mặt hàng sắp hết kho (stockQuantity <= lowStockThreshold)
     */
    getLowStockByBranch: async (branchId) => {
        return await Inventory.find({
            branchId,
            isDeleted: false,
            $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
        }).populate('productId', 'name images units status slug').lean();
    },

    /**
     * Ghi nhật ký biến động kho
     */
    createLog: async (logData, session = null) => {
        const { InventoryLog } = await import('#models/inventoryLogModel.js');
        const options = session ? { session } : {};
        // Dùng [logData] để create trả về array đồng bộ với repository patterns khác
        return await InventoryLog.create([logData], options);
    },

    /**
     * Lấy lịch sử biến động kho theo chi nhánh
     */
    getHistoryByBranch: async (branchId, limit = 50) => {
        const { InventoryLog } = await import('#models/inventoryLogModel.js');
        return await InventoryLog.find({ branchId })
            .populate('productId', 'name')
            .populate('userId', 'fullName')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    },

    /**
     * Thiết lập ngưỡng cảnh báo tồn kho thấp
     */
    setThreshold: async (productId, branchId, lowStockThreshold) => {
        return await Inventory.findOneAndUpdate(
            { productId, branchId, isDeleted: false },
            { lowStockThreshold },
            { upsert: true, new: true }
        ).lean();
    }
};
