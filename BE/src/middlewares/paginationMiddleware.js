/**
 * Middleware chuẩn hóa tham số phân trang (Pagination Parser)
 * Senior Fullstack: REUSABLE LOGIC
 */
export const paginationMiddleware = (req, res, next) => {
    // 1. Phân tích page và limit từ query, mặc định là 1 và 10
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // 2. Chặn giá trị âm hoặc quá lớn (DoS protection)
    req.pagination = {
        page: page < 1 ? 1 : page,
        limit: limit < 1 ? 10 : (limit > 100 ? 100 : limit)
    };

    next();
};
