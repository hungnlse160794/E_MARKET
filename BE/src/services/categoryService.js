import { CATEGORY_REPOSITORY } from '#repositories/categoryRepository.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';
import { PERMISSION_UTIL } from '#utils/permissionUtil.js';
import ApiError from '#utils/ApiError.js';
import { COMMON_CONSTANTS } from '#constants/common.js';

export const categoryService = {
    /**
     * @description Tạo danh mục mới cho Chi nhánh
     */
    createCategory: async (categoryData, requestUser) => {
        let { name, shopId, branchId, parentId } = categoryData;

        // Normalize parentId: "" to null
        if (!parentId || parentId === '') {
            parentId = null;
            categoryData.parentId = null;
        }

        // 1. Chặn Admin theo yêu cầu người dùng
        if (requestUser.role === COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
            throw new ApiError(ERROR_CODES.FORBIDDEN, ['Admin không có quyền quản lý danh mục của chi nhánh']);
        }

        // 2. Validate ràng buộc (Phải có shopId và branchId)
        if (!shopId || !branchId) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Thiếu ID Shop hoặc ID Chi nhánh']);
        }

        // 3. Kiểm quyền truy cập Chi nhánh
        PERMISSION_UTIL.verifyBranchOwnership({ _id: branchId, shopId }, requestUser);

        // 4. Kiểm tra Parent (nếu có)
        if (parentId) {
            const parent = await CATEGORY_REPOSITORY.findById(parentId);
            if (!parent) throw new ApiError(ERROR_CODES.CATEGORY_NOT_FOUND, ['Danh mục cha không tồn tại']);
        }

        // 5. Unique Slug trong phạm vi Chi nhánh
        const slug = GENERATE_UTILS.generateSlug(name);
        const existing = await CATEGORY_REPOSITORY.findBySlugAndBranch(slug, branchId);
        if (existing) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Tên danh mục này đã tồn tại trong chi nhánh']);
        }

        return await CATEGORY_REPOSITORY.create({
            ...categoryData,
            slug
        });
    },

    /**
     * @description Lấy danh sách danh mục theo Chi nhánh
     */
    getCategoriesByBranchId: async (branchId, requestUser) => {
        // Kiểm quyền xem (Shop Owner có thể xem mọi branch của họ, Manager chỉ xem branch mình)
        // Lưu ý: Cần fetch branch để lấy shopId phục vụ check permission
        // Ở đây ta đơn giản hóa vì route list thường được lọc bởi validateScope ở middleware
        return await CATEGORY_REPOSITORY.findByBranchId(branchId);
    },

    getCategoryById: async (id) => {
        const category = await CATEGORY_REPOSITORY.findById(id);
        if (!category) throw new ApiError(ERROR_CODES.CATEGORY_NOT_FOUND);
        return category;
    },

    /**
     * @description Cập nhật danh mục chi nhánh
     */
    updateCategory: async (id, updateData, requestUser) => {
        // Normalize parentId: "" to null
        if (updateData.parentId === '') {
            updateData.parentId = null;
        }
        const category = await CATEGORY_REPOSITORY.findById(id);
        if (!category) throw new ApiError(ERROR_CODES.CATEGORY_NOT_FOUND);

        // 1. Chặn Admin
        if (requestUser.role === COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
            throw new ApiError(ERROR_CODES.FORBIDDEN, ['Admin không có quyền quản lý danh mục của chi nhánh']);
        }

        // 2. Kiểm quyền sở hữu chi nhánh
        PERMISSION_UTIL.verifyBranchOwnership(category, requestUser);

        // 3. Slug check
        if (updateData.name) {
            const newSlug = GENERATE_UTILS.generateSlug(updateData.name);
            const existing = await CATEGORY_REPOSITORY.findBySlugAndBranch(newSlug, category.branchId);
            if (existing && existing._id.toString() !== id) {
                throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Tên danh mục mới đã tồn tại']);
            }
            updateData.slug = newSlug;
        }

        return await CATEGORY_REPOSITORY.update(id, updateData);
    },

    /**
     * @description Xóa danh mục chi nhánh
     */
    deleteCategory: async (id, requestUser) => {
        const category = await CATEGORY_REPOSITORY.findById(id);
        if (!category) throw new ApiError(ERROR_CODES.CATEGORY_NOT_FOUND);

        // 1. Chặn Admin
        if (requestUser.role === COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
            throw new ApiError(ERROR_CODES.FORBIDDEN, ['Admin không có quyền quản lý danh mục của chi nhánh']);
        }

        // 2. Kiểm quyền
        PERMISSION_UTIL.verifyBranchOwnership(category, requestUser);

        // 3. Kiểm tra danh mục con
        const children = await CATEGORY_REPOSITORY.findChildren(id);
        if (children.length > 0) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Không thể xóa danh mục đang có danh mục con']);
        }

        // 4. Kiểm tra sản phẩm
        const productCount = await CATEGORY_REPOSITORY.countProductsByCategory(id);
        if (productCount > 0) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, [`Không thể xóa danh mục đang có ${productCount} sản phẩm trực thuộc`]);
        }

        return await CATEGORY_REPOSITORY.deleteById(id);
    }
};
