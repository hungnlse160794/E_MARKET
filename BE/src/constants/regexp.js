/**
 * Danh sách các biểu thức chính quy (Regular Expressions) dùng chung cho toàn hệ thống
 */

export const REGEXP = {
    // Mật khẩu: 8-32 ký tự, ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,32}$/,
    
    // Số điện thoại Việt Nam (10-11 số)
    PHONE: /^[0-9]{10,11}$/,

    // MongoDB ObjectId (24 ký tự hex)
    OBJECT_ID: /^[0-9a-fA-F]{24}$/,
    
    // Ký tự nhạy cảm trong NoSQL
    NOSQL_CHARS: {
        DOLLAR: '$',
        DOT: '.'
    },

    // Slug generation
    SLUG: {
        VIETNAMESE_ACCENTS: /[\u0300-\u036f]/g,
        NON_ALPHANUMERIC: /[^\w\s-]/g,
        MULTIPLE_SPACES: /[\s_-]+/g,
        TRIM_DASHES: /^-+|-+$/g
    }
};
