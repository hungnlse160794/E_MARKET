import sanitize from '#utils/sanitizeUtil.js'

// Giới hạn độ dài lưu trữ: 2000 ký tự (Khoảng 2KB)
// Quá mức này sẽ bị cắt bớt để không làm phình MongoDB
const MAX_RESPONSE_LENGTH = 2000

/**
 * Xử lý, lọc và định dạng lại dữ liệu Response trước khi lưu vào Audit Log
 * @param {any} body - Dữ liệu thực tế chuẩn bị trả về cho Client
 * @returns {Object|String|null} Dữ liệu đã được an toàn hóa
 */
export const formatResponseForAuditLog = (body) => {
    // 1. Bỏ qua nếu không có dữ liệu
    if (body === undefined || body === null) return null

    try {
        // 2. Lọc dữ liệu nhạy cảm ở đầu ra (Cực kỳ quan trọng)
        // Dùng lại hàm sanitize đã viết để che giấu accessToken, refreshToken...
        const sanitizedBody = sanitize(body)

        // 3. Ép kiểu về chuỗi để đo kích thước an toàn
        const stringified = JSON.stringify(sanitizedBody)

        // 4. Xử lý khi dữ liệu quá "Béo"
        if (stringified.length > MAX_RESPONSE_LENGTH) {

            // Khai thác thêm ngữ cảnh: Nếu trong data là một mảng, ta đếm số lượng
            const isArrayData = Array.isArray(sanitizedBody?.data)
            const dataLength = isArrayData ? sanitizedBody.data.length : 'N/A'

            return {
                _audit_note: `⚠️ Phản hồi quá lớn (${stringified.length} bytes). Đã tự động cắt bớt.`,
                ...(isArrayData && { _total_items: dataLength }),
                // Trích xuất 1000 ký tự đầu tiên để làm bản xem trước
                preview_data: stringified.substring(0, 1000) + '... [TRUNCATED]'
            }
        }

        // 5. Nếu kích thước ổn, trả về Object nguyên bản (đã sanitize) 
        // để MongoDB lưu dưới định dạng BSON tra cứu cho nhanh
        return sanitizedBody

    } catch (error) {
        // 6. Xử lý an toàn (Fail-safe)
        // Bắt lỗi trong trường hợp JSON.stringify thất bại (Circular reference, Buffer file...)
        return {
            _audit_note: 'Lỗi trong quá trình parse dữ liệu phản hồi',
            error_message: error.message || 'Unknown Error'
        }
    }
}