import ApiError from '#utils/ApiError.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';

/**
 * Middleware kiểm tra Role tối thiểu hoặc Role cụ thể
 * @param {Array} allowedRoles Danh sách các Role được phép truy cập
 */
export const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(ERROR_CODES.UNAUTHORIZED));
        }

        // PLATFORM_ADMIN luôn có quyền truy cập mọi nơi (God Mode)
        if (req.user.role === COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
            return next();
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền thực hiện hành động này']));
        }

        next();
    };
};

/**
 * Middleware kiểm soát phạm vi truy cập (Scope)
 * Đảm bảo người dùng chỉ được thao tác trong Shop hoặc Branch của chính mình
 */
export const validateScope = (scopeType = COMMON_CONSTANTS.SCOPE_TYPE.SHOP) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) return next(new ApiError(ERROR_CODES.UNAUTHORIZED));

        // ADMIN lọt qua mọi khe cửa
        if (user.role === COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) return next();

        // 1. Kiểm tra Shop Scope
        if (scopeType === COMMON_CONSTANTS.SCOPE_TYPE.SHOP) {
            const targetShopId = (req.params.shopId || req.body.shopId || req.query.shopId)?.toString();
            
            if (targetShopId) {
                const userShopId = user.shopId?.toString();
                if (targetShopId !== userShopId) {
                    return next(new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không thể thao tác trên gian hàng khác']));
                }
            }
        }

        // 2. Kiểm tra Branch Scope
        if (scopeType === COMMON_CONSTANTS.SCOPE_TYPE.BRANCH) {
            const targetBranchId = (req.params.branchId || req.body.branchId || req.query.branchId)?.toString();
            
            if (targetBranchId) {
                if (user.role === COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER) {
                    const userManagedBranches = (user.managedBranches || []).map(id => id.toString());
                    if (targetBranchId !== user.branchId?.toString() && !userManagedBranches.includes(targetBranchId)) {
                        return next(new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền quản lý chi nhánh này']));
                    }
                } else if (user.role === COMMON_CONSTANTS.USER_ROLE.STAFF) {
                    if (targetBranchId !== user.branchId?.toString()) {
                        return next(new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền thao tác trên chi nhánh này']));
                    }
                }
            }
        }

        next();
    };
};
