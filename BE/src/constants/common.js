/**
 * Các hằng số cấu hình chung cho hệ thống
 */

export const COMMON_CONSTANTS = {
    // Security & Auth
    BCRYPT_SALT_ROUNDS: 10,

    // Cookie Config
    COOKIE_REFRESH_TOKEN: 'refreshToken',
    COOKIE_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 ngày

    // Request Limits
    BODY_SIZE_LIMIT: '10mb',

    // Rate Limiting Default Config
    RATE_LIMIT_STRICT_MS: 15 * 60 * 1000, // 15 phút
    RATE_LIMIT_STRICT_MAX: 10,
    RATE_LIMIT_API_MS: 1 * 60 * 1000,    // 1 phút
    RATE_LIMIT_API_MAX: 60,

    // Audit Logging
    SKIP_LOG_PATHS: ['/api-docs', '/health'],
    RETENTION_DAYS: 8, // Tự động xóa sau 8 ngày (đã tối ưu theo ý anh)
    LOG_METHODS: ['POST', 'PUT', 'PATCH', 'DELETE'], // Chỉ log các hành động thay đổi dữ liệu
    MAX_LOG_VALUE_LENGTH: 1000, // Giới hạn độ dài chuỗi trong log để tránh tràn ram/db

    // Error & Logic Messages
    CORS_NOT_ALLOWED: 'Not allowed by CORS',
    CORS_FORBIDDEN_MSG: 'Chính sách CORS không cho phép truy cập từ origin này.',
    DEFAULT_ERROR_MSG: 'Đã có lỗi xảy ra, vui lòng thử lại sau.',
    DEFAULT_ERROR_STATUS: 400,

    // Timeouts
    REQUEST_TIMEOUT_MS: 30000,
    LOCAL_IP: '127.0.0.1',

    // User Roles
    USER_ROLE: {
        CUSTOMER: 'CUSTOMER',
        SHOP_OWNER: 'SHOP_OWNER',
        BRANCH_MANAGER: 'BRANCH_MANAGER',
        STAFF: 'STAFF',
        PLATFORM_ADMIN: 'PLATFORM_ADMIN'
    },

    // Scope Types (dùng cho validateScope middleware)
    SCOPE_TYPE: {
        SHOP: 'SHOP',
        BRANCH: 'BRANCH'
    },

    // User Status
    USER_STATUS: {
        ACTIVE: 'ACTIVE',
        BANNED: 'BANNED',
        PENDING: 'PENDING'
    },

    // Shop Status
    SHOP_STATUS: {
        ACTIVE: 'ACTIVE',
        INACTIVE: 'INACTIVE',
        PENDING: 'PENDING'
    },

    // Category Status
    CATEGORY_STATUS: {
        ACTIVE: 'ACTIVE',
        HIDDEN: 'HIDDEN'
    },

    // Product Status
    PRODUCT_STATUS: {
        AVAILABLE: 'AVAILABLE',
        OUT_OF_STOCK: 'OUT_OF_STOCK',
        HIDDEN: 'HIDDEN'
    },

    // Payment Methods
    PAYMENT_METHOD: {
        COD: 'COD',
        VNPAY: 'VNPAY',
        WALLET: 'WALLET'
    },

    // Payment Status
    PAYMENT_STATUS: {
        PENDING: 'PENDING',
        PAID: 'PAID',
        FAILED: 'FAILED',
        REFUNDED: 'REFUNDED'
    },

    // Order Status (SubOrder)
    ORDER_STATUS: {
        PENDING: 'PENDING',
        CONFIRMED: 'CONFIRMED',
        PREPARING: 'PREPARING',
        SHIPPING: 'SHIPPING',
        DELIVERED: 'DELIVERED',
        CANCELLED: 'CANCELLED'
    },

    // Transaction Types
    TRANSACTION_TYPE: {
        ORDER_REVENUE: 'ORDER_REVENUE',
        WITHDRAWAL: 'WITHDRAWAL',
        REFUND: 'REFUND',
        FEE_DEDUCTION: 'FEE_DEDUCTION'
    },

    // Transaction Status
    TRANSACTION_STATUS: {
        PENDING: 'PENDING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED'
    },

    // Notification types
    NOTIFICATION_TYPE: {
        ORDER: 'ORDER',
        NEW_ORDER: 'NEW_ORDER', // Thêm mới cho Phase 3
        PROMOTION: 'PROMOTION',
        SYSTEM: 'SYSTEM',
        CHAT: 'CHAT'
    },

    // Shop Categories
    SHOP_CATEGORY: {
        FOOD: 'FOOD',
        FASHION: 'FASHION',
        ELECTRONICS: 'ELECTRONICS',
        OTHER: 'OTHER'
    },

    // Stock Request Status
    STOCK_REQUEST_STATUS: {
        PENDING: 'PENDING',
        APPROVED: 'APPROVED',
        SHIPPING: 'SHIPPING',
        COMPLETED: 'COMPLETED',
        REJECTED: 'REJECTED',
        CANCELLED: 'CANCELLED'
    }
};
