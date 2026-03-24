import { VOUCHER_REPOSITORY } from '#repositories/voucherRepository.js';
import { BRANCH_REPOSITORY } from '#repositories/branchRepository.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { PERMISSION_UTIL } from '#utils/permissionUtil.js';
import ApiError from '#utils/ApiError.js';

export const voucherService = {
    createVoucher: async (voucherData, requestUser) => {
        // 1. Phân quyền: Sàn vs Shop vs Branch
        if (voucherData.shopId) {
            PERMISSION_UTIL.verifyShopOwnership(voucherData.shopId, requestUser);
            
            // Nếu có branchId, phải verify quyền quản lý chi nhánh đó
            if (voucherData.branchId) {
                const branch = await BRANCH_REPOSITORY.findById(voucherData.branchId);
                if (!branch) throw new ApiError(ERROR_CODES.RESOURCE_NOT_FOUND, ['Chi nhánh không tồn tại']);
                PERMISSION_UTIL.verifyBranchOwnership(branch, requestUser);
            }
        } else {
            // Voucher của Sàn: Chỉ Admin
            if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
                throw new ApiError(ERROR_CODES.FORBIDDEN, ['Chỉ Admin mới được tạo voucher sàn']);
            }
        }

        const existingVoucher = await VOUCHER_REPOSITORY.findByCode(voucherData.code);
        if (existingVoucher) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Mã voucher này đã tồn tại']);
        }

        return await VOUCHER_REPOSITORY.create({
            ...voucherData,
            createdBy: requestUser.userId
        });
    },

    getVoucherByCode: async (code) => {
        const voucher = await VOUCHER_REPOSITORY.findByCode(code);
        if (!voucher) throw new ApiError(ERROR_CODES.VOUCHER_NOT_FOUND);
        return voucher;
    },

    getShopVouchers: async (shopId) => {
        return await VOUCHER_REPOSITORY.findShopVouchers(shopId);
    },

    getPlatformVouchers: async () => {
        return await VOUCHER_REPOSITORY.findPlatformVouchers();
    },

    applyVoucher: async (code, shopId, totalAmount, branchId = null) => {
        const voucher = await VOUCHER_REPOSITORY.findByCode(code);
        if (!voucher) throw new ApiError(ERROR_CODES.VOUCHER_NOT_FOUND);

        const now = new Date();
        if (now < new Date(voucher.startDate) || now > new Date(voucher.endDate)) {
            throw new ApiError(ERROR_CODES.VOUCHER_EXPIRED);
        }

        if (voucher.usedCount >= voucher.usageLimit) {
            throw new ApiError(ERROR_CODES.VOUCHER_LIMIT_REACHED);
        }

        // BẢO MẬT: Kiểm tra Shop
        if (voucher.shopId && voucher.shopId.toString() !== shopId?.toString()) {
            throw new ApiError(ERROR_CODES.FORBIDDEN, ['Voucher này không áp dụng cho gian hàng này']);
        }

        // BẢO MẬT: Kiểm tra Chi nhánh (Senior BA Constraint)
        if (voucher.branchId && voucher.branchId.toString() !== branchId?.toString()) {
            throw new ApiError(ERROR_CODES.FORBIDDEN, ['Voucher này chỉ áp dụng cho một chi nhánh cụ thể khác']);
        }

        if (totalAmount < voucher.minOrderValue) {
            throw new ApiError(ERROR_CODES.MIN_ORDER_VALUE_NOT_MET, [`Giá trị đơn hàng tối thiểu để dùng mã này là ${voucher.minOrderValue}`]);
        }

        let discount = 0;
        if (voucher.discountType === 'FIXED') {
            discount = voucher.discountValue;
        } else {
            discount = (totalAmount * voucher.discountValue) / 100;
            if (voucher.maxDiscount && discount > voucher.maxDiscount) {
                discount = voucher.maxDiscount;
            }
        }

        return { discount, voucherId: voucher._id };
    },

    updateVoucher: async (id, updateData, requestUser) => {
        const voucher = await VOUCHER_REPOSITORY.findById(id);
        if (!voucher) throw new ApiError(ERROR_CODES.VOUCHER_NOT_FOUND);

        // REFACTORED: Kiểm tra quyền sở hữu Shop của voucher hoặc Admin
        if (voucher.shopId) {
            PERMISSION_UTIL.verifyShopOwnership(voucher.shopId, requestUser);
        } else if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
            throw new ApiError(ERROR_CODES.FORBIDDEN);
        }

        return await VOUCHER_REPOSITORY.updateById(id, updateData);
    },

    deleteVoucher: async (id, requestUser) => {
        const voucher = await VOUCHER_REPOSITORY.findById(id);
        if (!voucher) throw new ApiError(ERROR_CODES.VOUCHER_NOT_FOUND);

        if (voucher.shopId) {
            PERMISSION_UTIL.verifyShopOwnership(voucher.shopId, requestUser);
        } else if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
            throw new ApiError(ERROR_CODES.FORBIDDEN);
        }

        await VOUCHER_REPOSITORY.deleteById(id);
        return true;
    }
};
