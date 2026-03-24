import ApiError from '#utils/ApiError.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';

export const PERMISSION_UTIL = {
    /**
     * @description Kiểm tra xem người dùng có quyền sở hữu/quản lý tài nguyên thuộc về một Shop cụ thể hay không.
     * @pattern Senior Fullstack: Centralized Ownership Check
     */
    verifyShopOwnership: (resourceShopId, requestUser) => {
        // 1. PLATFORM_ADMIN bypass tất cả (God Mode)
        if (requestUser.role === COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) return;

        // 2. Chuyển đổi ID sang string để so sánh an toàn
        const targetId = resourceShopId?.toString();
        const userShopId = requestUser.shopId ? requestUser.shopId.toString() : null;

        // 3. Logic: Phải là shop của mình
        if (targetId !== userShopId) {
            throw new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền thao tác trên tài nguyên của gian hàng này']);
        }
    },

    /**
     * @description Kiểm tra quyền truy cập chi nhánh (Branch)
     */
    verifyBranchOwnership: (branchObject, requestUser) => {
        if (requestUser.role === COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) return;

        // Branch Manager: Quản lý chi nhánh được assign (trong managedBranches hoặc branchId)
        if (requestUser.role === COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER) {
            const userManagedBranches = (requestUser.managedBranches || []).map(id => id.toString());
            const targetBranchId = branchObject._id.toString();

            if (targetBranchId !== requestUser.branchId?.toString() && !userManagedBranches.includes(targetBranchId)) {
                throw new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền quản lý chi nhánh này']);
            }
        }

        // Shop Owner: Được quản lý tất cả chi nhánh thuộc Shop của mình
        const branchShopId = branchObject.shopId.toString();
        PERMISSION_UTIL.verifyShopOwnership(branchShopId, requestUser);
    },

    /**
     * @description Kiểm tra xem người dùng có phải là người tạo ra tài nguyên không (e.g. Blog, Review, Order)
     */
    verifyAuthor: (userId, requestUser) => {
        if (requestUser.role === COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) return;

        if (userId.toString() !== requestUser.userId.toString()) {
            throw new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền thao tác trên nội dung của người khác']);
        }
    }
};
