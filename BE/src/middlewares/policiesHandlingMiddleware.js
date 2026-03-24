import ApiError from '#utils/ApiError.js'
import { ERROR_CODES } from '#constants/errorCode.js'

/**
 * Kiểm tra User có thuộc danh sách Role được phép không
 * @param {...String} allowedRoles - Danh sách role (CUSTOMER, SHOP_OWNER, PLATFORM_ADMIN)
 */
export const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(ERROR_CODES.UNAUTHORIZED, ['Vui lòng đăng nhập']))
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền thực hiện hành động này'], 403)
            )
        }
        next()
    }
}

/**
 * Kiểm tra xem dữ liệu có thuộc quyền sở hữu của Shop đó không
 * Dùng cho các API của Chú 6 (Shop_Owner)
 */
export const isShopOwner = (req, res, next) => {
    const shopIdFromParam = req.params.shopId

    // Nếu là Admin sàn thì cho qua hết, nếu là Chủ shop thì phải check đúng shopId
    if (req.user.role !== 'PLATFORM_ADMIN' && req.user.shopId !== shopIdFromParam) {
        return next(
            new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không quản lý gian hàng này'], 403)
        )
    }
    next()
}