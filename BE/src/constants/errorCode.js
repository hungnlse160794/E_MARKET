import { StatusCodes } from 'http-status-codes';

/**
 * Danh mục mã lỗi toàn diện cho hệ thống SaaS Multi-Vendor
 * Cấu trúc: [MODULE]_[ERROR_NAME]
 */

export const ERROR_CODES = {
    // --- 1. HỆ THỐNG & HẠ TẦNG (SYSTEM & INFRA) ---
    INTERNAL_SERVER_ERROR: {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Lỗi hệ thống, vui lòng thử lại sau.'
    },
    SERVICE_UNAVAILABLE: {
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Dịch vụ tạm thời không khả dụng.'
    },
    DATABASE_CONNECTION_ERROR: {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        code: 'DATABASE_CONNECTION_ERROR',
        message: 'Lỗi kết nối cơ sở dữ liệu.'
    },
    RATE_LIMIT_EXCEEDED: {
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.'
    },
    INVALID_REQUEST_DATA: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'INVALID_REQUEST_DATA',
        message: 'Dữ liệu yêu cầu không hợp lệ.'
    },
    RESOURCE_NOT_FOUND: {
        statusCode: StatusCodes.NOT_FOUND,
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy tài nguyên.'
    },

    // --- 2. XÁC THỰC & BẢO MẬT (AUTH & SECURITY) ---
    UNAUTHORIZED: {
        statusCode: StatusCodes.UNAUTHORIZED,
        code: 'UNAUTHORIZED',
        message: 'Bạn không có quyền truy cập.'
    },
    FORBIDDEN: {
        statusCode: StatusCodes.FORBIDDEN,
        code: 'FORBIDDEN',
        message: 'Truy cập bị từ chối.'
    },
    INVALID_CREDENTIALS: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
    },
    EMAIL_ALREADY_EXISTS: {
        statusCode: StatusCodes.CONFLICT,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email đã tồn tại. Vui lòng sử dụng email khác.'
    },
    ACCOUNT_LOCKED: {
        statusCode: StatusCodes.FORBIDDEN,
        code: 'ACCOUNT_LOCKED',
        message: 'Tài khoản đã bị khóa. Vui lòng thử lại sau 15 phút.'
    },
    TOKEN_EXPIRED: {
        statusCode: StatusCodes.UNAUTHORIZED,
        code: 'TOKEN_EXPIRED',
        message: 'Token xác thực đã hết hạn. Vui lòng đăng nhập lại.'
    },
    INVALID_REFRESH_TOKEN: {
        statusCode: StatusCodes.UNAUTHORIZED,
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Token làm mới không hợp lệ.'
    },
    OTP_INVALID: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'OTP_INVALID',
        message: 'Mã OTP không chính xác.'
    },
    OTP_EXPIRED: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'OTP_EXPIRED',
        message: 'Mã OTP đã hết hạn.'
    },
    CAPTCHA_REQUIRED: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'CAPTCHA_REQUIRED',
        message: 'Vui lòng xác thực Captcha.'
    },

    // --- 3. QUẢN LÝ GIAN HÀNG (SHOP/TENANT) ---
    SHOP_NOT_FOUND: {
        statusCode: StatusCodes.NOT_FOUND,
        code: 'SHOP_NOT_FOUND',
        message: 'Không tìm thấy gian hàng.'
    },
    SHOP_ALREADY_EXISTS: {
        statusCode: StatusCodes.CONFLICT,
        code: 'SHOP_ALREADY_EXISTS',
        message: 'Tên gian hàng đã tồn tại.'
    },
    SHOP_UNAUTHORIZED: {
        statusCode: StatusCodes.FORBIDDEN,
        code: 'SHOP_UNAUTHORIZED',
        message: 'Bạn không có quyền quản lý gian hàng này.'
    },
    SHOP_INACTIVE: {
        statusCode: StatusCodes.FORBIDDEN,
        code: 'SHOP_INACTIVE',
        message: 'Gian hàng đang bị khóa hoặc tạm dừng.'
    },
    BRANCH_NOT_FOUND: {
        statusCode: StatusCodes.NOT_FOUND,
        code: 'BRANCH_NOT_FOUND',
        message: 'Không tìm thấy chi nhánh.'
    },
    COMMISSION_RATE_INVALID: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'COMMISSION_RATE_INVALID',
        message: 'Tỷ lệ hoa hồng không hợp lệ.'
    },

    // --- 4. SẢN PHẨM & TỒN KHO (PRODUCT & INVENTORY) ---
    PRODUCT_NOT_FOUND: {
        statusCode: StatusCodes.NOT_FOUND,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Không tìm thấy sản phẩm.'
    },
    PRODUCT_OUT_OF_STOCK: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'PRODUCT_OUT_OF_STOCK',
        message: 'Sản phẩm đã hết hàng.'
    },
    INVALID_UOM: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'INVALID_UOM',
        message: 'Đơn vị tính không hợp lệ.'
    },
    CATEGORY_NOT_FOUND: {
        statusCode: StatusCodes.NOT_FOUND,
        code: 'CATEGORY_NOT_FOUND',
        message: 'Không tìm thấy danh mục sản phẩm.'
    },
    INVENTORY_INSUFFICIENT: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'INVENTORY_INSUFFICIENT',
        message: 'Tồn kho không đủ.'
    },

    // --- 5. ĐƠN HÀNG & GIỎ HÀNG (ORDER & CART) ---
    ORDER_NOT_FOUND: {
        statusCode: StatusCodes.NOT_FOUND,
        code: 'ORDER_NOT_FOUND',
        message: 'Không tìm thấy đơn hàng.'
    },
    ORDER_STATUS_INVALID: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'ORDER_STATUS_INVALID',
        message: 'Trạng thái đơn hàng không hợp lệ.'
    },
    ORDER_ALREADY_PAID: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'ORDER_ALREADY_PAID',
        message: 'Đơn hàng đã được thanh toán.'
    },
    CART_ITEM_NOT_FOUND: {
        statusCode: StatusCodes.NOT_FOUND,
        code: 'CART_ITEM_NOT_FOUND',
        message: 'Không tìm thấy sản phẩm trong giỏ hàng.'
    },
    SHARED_CART_EXPIRED: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'SHARED_CART_EXPIRED',
        message: 'Giỏ hàng chia sẻ đã hết hạn.'
    },
    MIN_ORDER_VALUE_NOT_MET: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'MIN_ORDER_VALUE_NOT_MET',
        message: 'Tổng giá trị đơn hàng chưa đạt mức tối thiểu.'
    },

    // --- 6. TÀI CHÍNH & VÍ (WALLET & TRANSACTION) ---
    WALLET_NOT_FOUND: {
        statusCode: StatusCodes.NOT_FOUND,
        code: 'WALLET_NOT_FOUND',
        message: 'Không tìm thấy ví.'
    },
    INSUFFICIENT_BALANCE: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'INSUFFICIENT_BALANCE',
        message: 'Số dư không đủ.'
    },
    TRANSACTION_FAILED: {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        code: 'TRANSACTION_FAILED',
        message: 'Giao dịch thất bại.'
    },
    WITHDRAWAL_DENIED: {
        statusCode: StatusCodes.FORBIDDEN,
        code: 'WITHDRAWAL_DENIED',
        message: 'Rút tiền bị từ chối.'
    },
    CURRENCY_NOT_SUPPORTED: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'CURRENCY_NOT_SUPPORTED',
        message: 'Loại tiền tệ không được hỗ trợ.'
    },
    ESCROW_ERROR: {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        code: 'ESCROW_ERROR',
        message: 'Lỗi hệ thống liên quan đến tiền treo đơn hàng.'
    },

    // --- 7. KHUYẾN MÃI & TƯƠNG TÁC (PROMOTION & ENGAGEMENT) ---
    VOUCHER_EXPIRED: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'VOUCHER_EXPIRED',
        message: 'Voucher đã hết hạn.'
    },
    VOUCHER_NOT_FOUND: {
        statusCode: StatusCodes.NOT_FOUND,
        code: 'VOUCHER_NOT_FOUND',
        message: 'Không tìm thấy voucher.'
    },
    VOUCHER_LIMIT_REACHED: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'VOUCHER_LIMIT_REACHED',
        message: 'Bạn đã sử dụng hết số lần áp dụng voucher này.'
    },
    REVIEW_ALREADY_SUBMITTED: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'REVIEW_ALREADY_SUBMITTED',
        message: 'Bạn đã đánh giá sản phẩm này rồi.'
    },

    // --- 8. MEDIA & UPLOAD ---
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    UPLOAD_FAILED: 'UPLOAD_FAILED',

    VALIDATION_ERROR: {
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu đầu vào không hợp lệ.'
    }
};

/**
 * Mapping Error Code sang HTTP Status Code
 * Giúp ApiError tự động biết trả về 400, 401 hay 403
 */
export const HTTP_STATUS = {
    [ERROR_CODES.INTERNAL_SERVER_ERROR.code]: StatusCodes.INTERNAL_SERVER_ERROR,
    [ERROR_CODES.SERVICE_UNAVAILABLE.code]: StatusCodes.SERVICE_UNAVAILABLE,
    [ERROR_CODES.RESOURCE_NOT_FOUND.code]: StatusCodes.NOT_FOUND,
    [ERROR_CODES.UNAUTHORIZED.code]: StatusCodes.UNAUTHORIZED,
    [ERROR_CODES.FORBIDDEN.code]: StatusCodes.FORBIDDEN,
    [ERROR_CODES.INVALID_REQUEST_DATA.code]: StatusCodes.BAD_REQUEST,
    [ERROR_CODES.EMAIL_ALREADY_EXISTS.code]: StatusCodes.CONFLICT,
    [ERROR_CODES.RATE_LIMIT_EXCEEDED.code]: StatusCodes.TOO_MANY_REQUESTS,
    [ERROR_CODES.INSUFFICIENT_BALANCE.code]: StatusCodes.BAD_REQUEST,
    [ERROR_CODES.ORDER_STATUS_INVALID.code]: StatusCodes.BAD_REQUEST,
    [ERROR_CODES.VALIDATION_ERROR.code]: StatusCodes.BAD_REQUEST,
};