import { INVENTORY_REPOSITORY } from '#repositories/inventoryRepository.js';
import { BRANCH_REPOSITORY } from '#repositories/branchRepository.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { PERMISSION_UTIL } from '#utils/permissionUtil.js';
import ApiError from '#utils/ApiError.js';

export const inventoryService = {
    /**
     * Cập nhật (Nhập/Xuất) kho
     * Phân quyền: BRANCH_MANAGER (Shop/Branch mình quản lý)
     */
    updateStock: async (stockData, requestUser) => {
        const { productId, branchId, stockQuantity, type = 'ADD', note } = stockData;

        // 1. Kiểm tra Chi nhánh tồn tại và Quyền Quản lý
        const branch = await BRANCH_REPOSITORY.findById(branchId);
        if (!branch) throw new ApiError(ERROR_CODES.BRANCH_NOT_FOUND);

        PERMISSION_UTIL.verifyBranchOwnership(branch, requestUser);

        // 2. Lấy tồn kho hiện tại để tính toán nhật ký
        const currentInventory = await INVENTORY_REPOSITORY.findByBranchAndProduct(productId, branchId);
        const oldQuantity = currentInventory?.stockQuantity || 0;

        // 3. Chuyển đổi Stock theo type (ADD/SUBTRACT/SET)
        let delta = 0;
        if (type === 'ADD') delta = stockQuantity;
        if (type === 'SUBTRACT') delta = -stockQuantity;
        if (type === 'SET') {
            delta = stockQuantity - oldQuantity;
        }

        const updatedInventory = await INVENTORY_REPOSITORY.updateStock(productId, branchId, delta);

        // 4. Ghi nhật ký biến động (có thể dùng background nhưng ở đây làm đồng bộ để chắc chắn)
        await INVENTORY_REPOSITORY.createLog({
            productId,
            branchId,
            userId: requestUser._id,
            type,
            quantity: Math.abs(delta),
            oldQuantity,
            newQuantity: updatedInventory.stockQuantity,
            note: note || `Điều chỉnh kho (${type})`
        });

        return updatedInventory;
    },

    getInventoryByBranch: async (branchId, requestUser) => {
        const branch = await BRANCH_REPOSITORY.findById(branchId);
        if (!branch) throw new ApiError(ERROR_CODES.BRANCH_NOT_FOUND);
        PERMISSION_UTIL.verifyBranchOwnership(branch, requestUser);
        return await INVENTORY_REPOSITORY.findByBranch(branchId);
    },

    getInventoryByShop: async (shopId, requestUser) => {
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);
        return await INVENTORY_REPOSITORY.findByShop(shopId);
    },

    getLowStockByBranch: async (branchId, requestUser) => {
        const branch = await BRANCH_REPOSITORY.findById(branchId);
        if (!branch) throw new ApiError(ERROR_CODES.BRANCH_NOT_FOUND);
        PERMISSION_UTIL.verifyBranchOwnership(branch, requestUser);
        return await INVENTORY_REPOSITORY.getLowStockByBranch(branchId);
    },

    getLowStockByShop: async (shopId, requestUser) => {
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);
        return await INVENTORY_REPOSITORY.getLowStockByShop(shopId);
    },

    getHistoryByBranch: async (branchId, requestUser) => {
        const branch = await BRANCH_REPOSITORY.findById(branchId);
        if (!branch) throw new ApiError(ERROR_CODES.BRANCH_NOT_FOUND);
        PERMISSION_UTIL.verifyBranchOwnership(branch, requestUser);
        return await INVENTORY_REPOSITORY.getHistoryByBranch(branchId);
    },

    getHistoryByShop: async (shopId, requestUser) => {
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);
        return await INVENTORY_REPOSITORY.getHistoryByShop(shopId);
    },

    setThreshold: async (data, requestUser) => {
        const { productId, branchId, lowStockThreshold } = data;
        const branch = await BRANCH_REPOSITORY.findById(branchId);
        if (!branch) throw new ApiError(ERROR_CODES.BRANCH_NOT_FOUND);
        PERMISSION_UTIL.verifyBranchOwnership(branch, requestUser);
        return await INVENTORY_REPOSITORY.setThreshold(productId, branchId, lowStockThreshold);
    },

    checkStockAvailability: async (productId, branchId, requestedAmount) => {
        const inventory = await INVENTORY_REPOSITORY.findByBranchAndProduct(productId, branchId);
        if (!inventory || inventory.stockQuantity < requestedAmount) {
            return { isAvailable: false, remaining: inventory?.stockQuantity || 0 };
        }
        return { isAvailable: true, remaining: inventory.stockQuantity };
    }
};
