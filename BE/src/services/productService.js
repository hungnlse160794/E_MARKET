import { PRODUCT_REPOSITORY } from '#repositories/productRepository.js';
import { BRANCH_REPOSITORY } from '#repositories/branchRepository.js';
import { INVENTORY_REPOSITORY } from '#repositories/inventoryRepository.js';
import { CATEGORY_REPOSITORY } from '#repositories/categoryRepository.js';
import { SHOP_REPOSITORY } from '#repositories/shopRepository.js';
import { ERROR_CODES } from '#constants/errorCode.js';
import { GENERATE_UTILS } from '#utils/generateUtil.js';
import { PERMISSION_UTIL } from '#utils/permissionUtil.js';
import ApiError from '#utils/ApiError.js';
import { sanitizeHtml } from '#utils/sanitizeHtmlUtil.js';

export const productService = {
    createProduct: async (productData, requestUser) => {
        const { shopId, branchId, categoryId, name, description } = productData;

        // 0. Kiểm tra sự tồn tại của shop, chi nhánh và danh mục
        const [shop, branch, category] = await Promise.all([
            SHOP_REPOSITORY.findById(shopId),
            BRANCH_REPOSITORY.findById(branchId),
            CATEGORY_REPOSITORY.findById(categoryId)
        ]);

        if (!shop) throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Cửa hàng (Shop) không tồn tại.']);
        if (!branch) throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Chi nhánh (Branch) không tồn tại.']);
        if (!category) throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Danh mục (Category) không tồn tại.']);

        // 0.5 Kiểm tra tính hợp lệ của mối quan hệ
        if (branch.shopId.toString() !== shopId) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Chi nhánh không thuộc cửa hàng này.']);
        }
        if (category.branchId.toString() !== branchId && category.shopId.toString() !== shopId) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Danh mục này không hợp lệ cho chi nhánh hiện tại.']);
        }

        // 1. Phân quyền: ShopOwner được tạo cho shop mình, Admin được tạo cho mọi shop
        PERMISSION_UTIL.verifyShopOwnership(shopId, requestUser);

        // 2. Kiểm tra trùng Slug trong cùng 1 Chi nhánh (Chống Spam URL)
        const slug = GENERATE_UTILS.generateSlug(name);
        const existingProduct = await PRODUCT_REPOSITORY.findByBranchAndSlug(productData.branchId, slug);
        if (existingProduct) {
            throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Sản phẩm này đã tồn tại trong gian hàng của bạn']);
        }

        // 3. Xử lý An toàn HTML cho mô tả sản phẩm (Chống Stored XSS)
        const sanitizedDescription = sanitizeHtml(description);

        // 4. Tạo Product mới
        const product = await PRODUCT_REPOSITORY.create({
            ...productData,
            slug,
            description: sanitizedDescription
        });

        // 5. Tự động khởi tạo tồn kho 0 cho chi nhánh được chỉ định
        await INVENTORY_REPOSITORY.updateStock(product._id, branchId, 0);

        return product;
    },

    getProductById: async (productId) => {
        const product = await PRODUCT_REPOSITORY.findById(productId);
        if (!product) throw new ApiError(ERROR_CODES.PRODUCT_NOT_FOUND);
        return product;
    },

    getBranchProducts: async (branchId, options, filters = {}) => {
        // Tích hợp phân trang (Pagination) chuẩn model đã audit
        return await PRODUCT_REPOSITORY.paginateByBranchId(branchId, options, filters);
    },

    updateProduct: async (productId, updateData, requestUser) => {
        const product = await PRODUCT_REPOSITORY.findById(productId);
        if (!product) throw new ApiError(ERROR_CODES.PRODUCT_NOT_FOUND);

        // 1. Kiểm tra Quyền
        PERMISSION_UTIL.verifyShopOwnership(product.shopId, requestUser);

        // 1.5. Kiểm tra danh mục nếu có thay đổi
        if (updateData.categoryId) {
            const category = await CATEGORY_REPOSITORY.findById(updateData.categoryId);
            if (!category) throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Danh mục (Category) mới không tồn tại.']);
            
            if (category.branchId.toString() !== product.branchId.toString() && category.shopId.toString() !== product.shopId.toString()) {
                throw new ApiError(ERROR_CODES.INVALID_REQUEST_DATA, ['Danh mục mới không thuộc chi nhánh này.']);
            }
        }

        // 2. Xử lý XSS nếu có cập nhật mô tả
        if (updateData.description) {
            updateData.description = sanitizeHtml(updateData.description);
        }

        return await PRODUCT_REPOSITORY.updateById(productId, updateData);
    },

    deleteProduct: async (productId, requestUser) => {
        const product = await PRODUCT_REPOSITORY.findById(productId);
        if (!product) throw new ApiError(ERROR_CODES.PRODUCT_NOT_FOUND);

        PERMISSION_UTIL.verifyShopOwnership(product.shopId, requestUser);

        // Soft delete đã được repo xử lý tự động
        return await PRODUCT_REPOSITORY.deleteById(productId);
    }
};
