import { SHOP_REPOSITORY } from '#repositories/shopRepository.js';
import { USER_REPOSITORY } from '#repositories/userRepository.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { COMMON_CONSTANTS } from '#constants/common.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';
import { PERMISSION_UTIL } from '#utils/permissionUtil.js';
import ApiError from '#utils/ApiError.js';
import { sanitizeHtml } from '#utils/sanitizeHtmlUtil.js';

export const shopService = {
    createShop: async (shopData, requestUser) => {
        const { name, ownerId, description } = shopData;

        // 1. Phân quyền: Chỉ ADMIN hoặc chính user được tạo shop cho user đó
        if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN &&
            requestUser.userId.toString() !== ownerId.toString()) {
            throw new ApiError(ERROR_CODES.FORBIDDEN);
        }

        // 2. Chống trùng lắp và SEO Slug cho gian hàng
        const slug = GENERATE_UTILS.generateSlug(name);
        if (await SHOP_REPOSITORY.findByName(name)) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Tên gian hàng này đã được sử dụng']);
        }

        // 3. Xử lý Stored XSS trong mô tả gian hàng
        const sanitizedDescription = sanitizeHtml(description);

        const newShop = await SHOP_REPOSITORY.create({
            ...shopData,
            slug,
            description: sanitizedDescription,
            status: COMMON_CONSTANTS.SHOP_STATUS.PENDING // Mặc định chờ duyệt khi mới đăng ký SaaS
        });

        // Tự động gán quyền SHOP_OWNER và cập nhật shopId cho User
        const user = await USER_REPOSITORY.findById(ownerId);
        const updateData = {
            shopId: newShop._id
        };

        // Nếu là Customer, nâng cấp lên Chủ Shop
        if (user.role === COMMON_CONSTANTS.USER_ROLE.CUSTOMER) {
            updateData.role = COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER;
        }

        // Cập nhật User thông qua Repository
        await USER_REPOSITORY.update(ownerId, updateData);

        return newShop;
    },

    getShopById: async (id) => {
        const shop = await SHOP_REPOSITORY.findById(id);
        if (!shop) throw new ApiError(ERROR_CODES.SHOP_NOT_FOUND);
        return shop;
    },

    updateShop: async (id, updateData, requestUser) => {
        const shop = await SHOP_REPOSITORY.findById(id);
        if (!shop) throw new ApiError(ERROR_CODES.SHOP_NOT_FOUND);

        // REFACTORED: Chỉ chủ shop hoặc ADMIN được sửa
        PERMISSION_UTIL.verifyShopOwnership(id, requestUser);

        if (updateData.description) {
            updateData.description = sanitizeHtml(updateData.description);
        }

        return await SHOP_REPOSITORY.update(id, updateData);
    },

    deleteShop: async (id, requestUser) => {
        const shop = await SHOP_REPOSITORY.findById(id);
        if (!shop) throw new ApiError(ERROR_CODES.SHOP_NOT_FOUND);

        // Quyền tối cao ADMIN hoặc SHOP_OWNER xóa shop mình
        PERMISSION_UTIL.verifyShopOwnership(id, requestUser);

        return await SHOP_REPOSITORY.deleteById(id);
    },

    createShopAccount: async (shopId, accountData, requestUser) => {
        // 1. Kiểm tra quyền sở hữu Shop
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);

        const { email } = accountData;

        // 2. Kiểm tra email tồn tại
        const existingUser = await USER_REPOSITORY.findByEmail(email);
        if (existingUser) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Email này đã được sử dụng']);
        }

        // 3. Tạo tài khoản mới
        const userToCreate = {
            ...accountData,
            shopId,
            status: COMMON_CONSTANTS.USER_STATUS?.ACTIVE || 'ACTIVE'
        };

        // Nếu là BRANCH_MANAGER, khởi tạo managedBranches chứa branchId được chọn
        if (accountData.role === COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER && accountData.branchId) {
            userToCreate.managedBranches = [accountData.branchId];
        }

        const newUser = await USER_REPOSITORY.create(userToCreate);

        const result = newUser.toObject();
        delete result.password;
        return result;
    },

    getDashboardMetrics: async (shopId) => {
        const { Branch } = await import('#models/branchModel.js');
        const { User } = await import('#models/userModel.js');

        const [totalBranches, activeBranches, totalStaff] = await Promise.all([
            Branch.countDocuments({ shopId, isDeleted: false }),
            Branch.countDocuments({ shopId, isOpen: true, isDeleted: false }),
            User.countDocuments({ shopId, role: { $in: [COMMON_CONSTANTS.USER_ROLE.STAFF, COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER] }, isDeleted: false })
        ]);

        return {
            totalBranches,
            activeBranches,
            totalStaff
        };
    },

    getShopAccounts: async (shopId, filter = {}, requestUser) => {
        // 1. Kiểm tra quyền (Chỉ Owner của shop đó hoặc ADMIN)
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);

        // 2. Lấy danh sách STAFF và BRANCH_MANAGER thuộc shopId
        const { User } = await import('#models/userModel.js');
        await import('#models/branchModel.js'); 

        const { branchId, role, search } = filter;
        const query = { 
            shopId, 
            role: { $in: [COMMON_CONSTANTS.USER_ROLE.STAFF, COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER] },
            isDeleted: false 
        };

        if (branchId) query.branchId = branchId;
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const accounts = await User.find(query)
        .select('-password')
        .populate('branchId', 'branchName')
        .populate('managedBranches', 'branchName')
        .sort({ createdAt: -1 })
        .lean();

        return accounts;
    },

    getShopAccountById: async (shopId, userId, requestUser) => {
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);

        const { User } = await import('#models/userModel.js');
        await import('#models/branchModel.js');

        const user = await User.findOne({ 
            _id: userId, 
            shopId, 
            isDeleted: false 
        })
        .select('-password')
        .populate('branchId', 'branchName')
        .populate('managedBranches', 'branchName')
        .lean();

        if (!user) {
            throw new ApiError(ERROR_CODES.RESOURCE_NOT_FOUND, ['Không tìm thấy tài khoản nhân sự này']);
        }

        return user;
    },

    updateShopAccount: async (shopId, userId, accountData, requestUser) => {
        // 1. Kiểm tra quyền sở hữu Shop
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);

        // 2. Tìm User cần cập nhật
        const user = await USER_REPOSITORY.findById(userId);
        if (!user || user.shopId.toString() !== shopId.toString()) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Tài khoản không tìm thấy hoặc không thuộc gian hàng này']);
        }

        // 3. Logic xử lý Role và Branch
        const updateData = { ...accountData };

        // SANITIZE: Không được ghi đè mật khẩu rỗng
        if (!updateData.password || updateData.password.trim() === "") {
            delete updateData.password;
        }

        const isRoleChanging = accountData.role && accountData.role !== user.role;
        const isBranchChanging = accountData.branchId && accountData.branchId.toString() !== (user.branchId || "").toString();

        if (accountData.role === COMMON_CONSTANTS.USER_ROLE.BRANCH_MANAGER) {
            // Nếu là Manager mới chuyển đổi hoặc manager đổi chi nhánh chính
            if (isRoleChanging || isBranchChanging) {
                const finalBranchId = accountData.branchId || user.branchId;
                if (finalBranchId) {
                    updateData.managedBranches = [finalBranchId];
                }
            }
            // Nếu không thay đổi role/branchId chính, ta KHÔNG chạm vào managedBranches 
            // vì có thể Manager đang quản lý đa chi nhánh qua công cụ phân phối riêng.
        } else if (accountData.role === COMMON_CONSTANTS.USER_ROLE.STAFF) {
            // Nếu đổi role về STAFF thì xóa sạch managedBranches
            updateData.managedBranches = [];
        }

        const updatedUser = await USER_REPOSITORY.update(userId, updateData);
        
        const result = { ...updatedUser };
        delete result.password;
        return result;
    },

    updateManagedBranches: async (shopId, userId, managedBranches, requestUser) => {
        // 1. Kiểm tra quyền sở hữu Shop
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);

        // 2. Kiểm tra User thuộc Shop
        const user = await USER_REPOSITORY.findById(userId);
        if (!user || user.shopId.toString() !== shopId.toString()) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Tài khoản không tìm thấy hoặc không thuộc gian hàng này']);
        }

        // 3. Cập nhật managedBranches
        const updatedUser = await USER_REPOSITORY.update(userId, { managedBranches });
        
        // 4. Populate để trả về cho Frontend hiển thị Badge ngay lập tức
        const { User } = await import('#models/userModel.js');
        await import('#models/branchModel.js');

        const result = await User.findById(userId)
            .select('-password')
            .populate('branchId', 'branchName')
            .populate('managedBranches', 'branchName')
            .lean();

        return result;
    },

    deleteShopAccount: async (shopId, userId, requestUser) => {
        // 1. Kiểm tra quyền sở hữu Shop
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);

        // 2. Kiểm tra User thuộc Shop
        const user = await USER_REPOSITORY.findById(userId);
        if (!user || user.shopId.toString() !== shopId.toString()) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Tài khoản không tìm thấy hoặc không thuộc gian hàng này']);
        }

        // 3. Thực hiện Soft Delete
        return await USER_REPOSITORY.deleteById(userId);
    }
};
