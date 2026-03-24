import { STOCK_REQUEST_REPOSITORY } from '#repositories/stockRequestRepository.js';
import { BRANCH_REPOSITORY } from '#repositories/branchRepository.js';
import { INVENTORY_REPOSITORY } from '#repositories/inventoryRepository.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { PERMISSION_UTIL } from '#utils/permissionUtil.js';
import ApiError from '#utils/ApiError.js';
import mongoose from 'mongoose';

export const stockRequestService = {
    /**
     * Tạo yêu cầu nhập kho
     * Phân quyền: BRANCH_MANAGER (Shop/Branch mình quản lý)
     */
    createRequest: async (requestData, requestUser) => {
        const { branchId, items, notes } = requestData;

        // 1. Kiểm tra Chi nhánh tồn tại và Quyền Quản lý
        const branch = await BRANCH_REPOSITORY.findById(branchId);
        if (!branch) throw new ApiError(ERROR_CODES.BRANCH_NOT_FOUND);

        PERMISSION_UTIL.verifyBranchOwnership(branch, requestUser);

        // 2. Tạo yêu cầu ở trạng thái PENDING
        return await STOCK_REQUEST_REPOSITORY.create({
            branchId,
            shopId: branch.shopId,
            requesterId: requestUser._id,
            items,
            notes,
            status: COMMON_CONSTANTS.STOCK_REQUEST_STATUS.PENDING
        });
    },

    /**
     * Cập nhật trạng thái yêu cầu
     * Phân quyền linh hoạt tùy trạng thái
     */
    updateStatus: async (id, status, requestUser, rejectionReason = null) => {
        const stockRequest = await STOCK_REQUEST_REPOSITORY.findById(id);
        if (!stockRequest) throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Yêu cầu không tồn tại']);

        // 1. Logic Phân Quyền & Chuyển trạng thái
        const oldStatus = stockRequest.status;
        const newStatus = status;

        // BA Case 1: Duyệt đơn (PENDING -> APPROVED/REJECTED) -> Chỉ dành cho SHOP_OWNER/ADMIN
        if (newStatus === COMMON_CONSTANTS.STOCK_REQUEST_STATUS.APPROVED ||
            newStatus === COMMON_CONSTANTS.STOCK_REQUEST_STATUS.REJECTED) {

            // Phải là chủ Shop hoặc Admin
            PERMISSION_UTIL.verifyShopOwnership(stockRequest.shopId._id || stockRequest.shopId, requestUser);

            if (oldStatus !== COMMON_CONSTANTS.STOCK_REQUEST_STATUS.PENDING) {
                throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Chỉ có thể duyệt/từ chối đơn đang ở trạng thái PENDING']);
            }

            return await STOCK_REQUEST_REPOSITORY.updateStatus(id, newStatus, requestUser._id, rejectionReason);
        }

        // BA Case 1.5: Bắt đầu giao hàng (APPROVED -> SHIPPING) -> Chỉ dành cho SHOP_OWNER (Theo feedback người dùng)
        if (newStatus === COMMON_CONSTANTS.STOCK_REQUEST_STATUS.SHIPPING) {
            // Kiểm tra: Chỉ Chủ shop mới được bấm giao hàng
            if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER && requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
                throw new ApiError(ERROR_CODES.FORBIDDEN, ['Chỉ có Chủ shop mới được phép chuyển trạng thái Đang giao']);
            }

            PERMISSION_UTIL.verifyShopOwnership(stockRequest.shopId._id || stockRequest.shopId, requestUser);

            if (oldStatus !== COMMON_CONSTANTS.STOCK_REQUEST_STATUS.APPROVED) {
                throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Chỉ có thể chuyển sang Đang giao khi đơn đã được duyệt (APPROVED)']);
            }

            return await STOCK_REQUEST_REPOSITORY.updateStatus(id, newStatus);
        }

        // BA Case 2: Xác nhận nhận hàng (APPROVED/SHIPPING -> COMPLETED) -> Dành cho MANAGER (người nhận)
        if (newStatus === COMMON_CONSTANTS.STOCK_REQUEST_STATUS.COMPLETED) {

            // Phải là người quản lý chi nhánh đó
            const branch = await BRANCH_REPOSITORY.findById(stockRequest.branchId._id || stockRequest.branchId);
            PERMISSION_UTIL.verifyBranchOwnership(branch, requestUser);

            if (oldStatus !== COMMON_CONSTANTS.STOCK_REQUEST_STATUS.APPROVED &&
                oldStatus !== COMMON_CONSTANTS.STOCK_REQUEST_STATUS.SHIPPING) {
                throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Chỉ có thể hoàn tất đơn đã được duyệt/đang giao']);
            }

            // ATOMIC: Chuyển trạng thái và cộng kho

            // TEST: Complete logic WITHOUT sessions/transactions to isolate the error
            try {
                // 1. Cập nhật trạng thái Request (Không có session)
                const updatedRequest = await STOCK_REQUEST_REPOSITORY.updateStatus(id, newStatus, null, null, null);

                // 2. Cập nhật tồn kho cho từng sản phẩm
                for (const item of stockRequest.items) {
                    const currentInventory = await INVENTORY_REPOSITORY.findByBranchAndProduct(
                        item.productId._id || item.productId,
                        stockRequest.branchId._id || stockRequest.branchId,
                        null
                    );
                    const oldQty = currentInventory?.stockQuantity || 0;

                    const updatedInv = await INVENTORY_REPOSITORY.updateStock(
                        item.productId._id || item.productId,
                        stockRequest.branchId._id || stockRequest.branchId,
                        item.quantity,
                        null
                    );

                    // 3. Ghi Log biến động kho
                    await INVENTORY_REPOSITORY.createLog({
                        productId: item.productId._id || item.productId,
                        branchId: stockRequest.branchId._id || stockRequest.branchId,
                        userId: requestUser._id,
                        type: 'ADD',
                        quantity: item.quantity,
                        oldQuantity: oldQty,
                        newQuantity: updatedInv.stockQuantity,
                        note: `Nhập kho từ yêu cầu: ${stockRequest.requestNumber}`
                    }, null);
                }

                return updatedRequest;
            } catch (error) {
                console.error('❌ CRITICAL ERROR (Bypassed Logic):', error);
                throw error;
            }
        }

        // BA Case 3: Huỷ đơn (PENDING -> CANCELLED) -> Dành cho chính người đã tạo (Manager)
        if (newStatus === COMMON_CONSTANTS.STOCK_REQUEST_STATUS.CANCELLED) {
            if (stockRequest.requesterId._id.toString() !== requestUser._id.toString()) {
                throw new ApiError(ERROR_CODES.UNAUTHORIZED_ACCESS);
            }
            if (oldStatus !== COMMON_CONSTANTS.STOCK_REQUEST_STATUS.PENDING) {
                throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Chỉ có thể huỷ đơn đang chờ duyệt']);
            }
            return await STOCK_REQUEST_REPOSITORY.updateStatus(id, newStatus);
        }

        throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Trạng thái chuyển đổi không hợp lệ']);
    },

    getRequestsByBranch: async (branchId, query, requestUser) => {
        const branch = await BRANCH_REPOSITORY.findById(branchId);
        if (!branch) throw new ApiError(ERROR_CODES.BRANCH_NOT_FOUND);
        PERMISSION_UTIL.verifyBranchOwnership(branch, requestUser);

        return await STOCK_REQUEST_REPOSITORY.findByBranch(branchId, query);
    },

    getRequestsByShop: async (shopId, query, requestUser) => {
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);
        return await STOCK_REQUEST_REPOSITORY.findByShop(shopId, query);
    }
};
