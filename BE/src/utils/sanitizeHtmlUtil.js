import xss from 'xss';

/**
 * Xử lý chuỗi HTML đầu vào để chống tấn công XSS (Stored XSS)
 * Chỉ giữ lại các thẻ an toàn (p, b, i, em, strong, br, etc.)
 */
export const sanitizeHtml = (html) => {
    if (!html) return html;
    
    // Cấu hình xss để lọc theo danh sách trắng (whitelist)
    return xss(html, {
        whiteList: {
            p: [],
            br: [],
            b: [],
            i: [],
            em: [],
            strong: [],
            u: [],
            ul: [],
            ol: [],
            li: [],
            span: ['style'], // Vẫn cho phép style cho chữ màu nhưng cần cẩn thận
            div: []
        },
        stripIgnoreTag: true, // Xóa các thẻ không có trong danh mục trắng
        stripIgnoreTagBody: ['script', 'style', 'xml'] // Xóa cả nội dung bên trong script/style
    });
};
