/**
 * Bọc các hàm async trong Controller để tự động bắt lỗi (Promise Rejection)
 * và chuyển tiếp đến middleware xử lý lỗi (next)
 * * @param {Function} fn - Hàm async controller (req, res, next)
 * @returns {Function} - Middleware function chuẩn Express
 */
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)
    }
}