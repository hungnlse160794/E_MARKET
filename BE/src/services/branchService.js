import { BRANCH_REPOSITORY } from '#repositories/branchRepository.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { SHOP_REPOSITORY } from '#repositories/shopRepository.js';
import ApiError from '#utils/ApiError.js';

export const branchService = {
    /**
     * Tạo chi nhánh mới cho Shop
     * Chỉ SHOP_OWNER (sở hữu shop) và ADMIN mới được tạo
     */
    createBranch: async (branchData, requestUser) => {
        // Xác minh Shop tồn tại
        const shop = await SHOP_REPOSITORY.findById(branchData.shopId);

        if (!shop) {
            throw new ApiError(ERROR_CODES.SHOP_NOT_FOUND);
        }

        // Kiểm tra quyền sở hữu Shop
        if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
            const shopId = branchData.shopId.toString();
            const userShopId = requestUser.shopId ? requestUser.shopId.toString() : null;

            if (shopId !== userShopId) {
                throw new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền tạo chi nhánh cho gian hàng này']);
            }
        }

        const newBranch = await BRANCH_REPOSITORY.create(branchData);
        return newBranch;
    },

    getBranchById: async (branchId) => {
        const branch = await BRANCH_REPOSITORY.findById(branchId);
        if (!branch) {
            throw new ApiError(ERROR_CODES.BRANCH_NOT_FOUND);
        }
        return branch;
    },

    getBranchesByShopId: async (shopId) => {
        return await BRANCH_REPOSITORY.findByShopId(shopId);
    },

    /**
     * Tìm chi nhánh gần nhất (theo toạ độ GPS)
     * Dùng cho khách hàng chọn branch gần nhất khi đặt hàng
     */
    getNearbyBranches: async (longitude, latitude, maxDistance) => {
        if (!longitude || !latitude) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Toạ độ (longitude, latitude) là bắt buộc']);
        }
        return await BRANCH_REPOSITORY.findNearby([longitude, latitude], maxDistance);
    },

    updateBranch: async (branchId, updateData, requestUser) => {
        const branch = await BRANCH_REPOSITORY.findById(branchId);
        if (!branch) {
            throw new ApiError(ERROR_CODES.BRANCH_NOT_FOUND);
        }

        // Kiểm tra quyền sở hữu: SHOP_OWNER sở hữu shop này, hoặc BRANCH_MANAGER được gán branch này
        if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
            const branchShopId = branch.shopId.toString();
            const userShopId = requestUser.shopId ? requestUser.shopId.toString() : null;
            const userBranchId = requestUser.branchId ? requestUser.branchId.toString() : null;
            const userManagedBranches = (requestUser.managedBranches || []).map(id => id.toString());

            // SHOP_OWNER: phải sở hữu shop
            // BRANCH_MANAGER: phải được gán đúng branch này (trực tiếp hoặc qua managedBranches)
            const isShopOwner = branchShopId === userShopId;
            const isBranchManager = requestUser.role === COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER
                && (userBranchId === branchId || userManagedBranches.includes(branchId));

            if (!isShopOwner && !isBranchManager) {
                throw new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền cập nhật chi nhánh này']);
            }
        }

        return await BRANCH_REPOSITORY.update(branchId, updateData);
    },

    deleteBranch: async (branchId, requestUser) => {
        const branch = await BRANCH_REPOSITORY.findById(branchId);
        if (!branch) {
            throw new ApiError(ERROR_CODES.BRANCH_NOT_FOUND);
        }

        // Chỉ SHOP_OWNER (sở hữu shop) và ADMIN mới được xóa branch
        if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
            const branchShopId = branch.shopId.toString();
            const userShopId = requestUser.shopId ? requestUser.shopId.toString() : null;

            if (branchShopId !== userShopId) {
                throw new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền xóa chi nhánh của gian hàng khác']);
            }
        }

        // TODO: Kiểm tra branch có Inventory hoặc SubOrder liên kết không (Phase 3)

        await BRANCH_REPOSITORY.deleteById(branchId);
        return true;
    }
};
