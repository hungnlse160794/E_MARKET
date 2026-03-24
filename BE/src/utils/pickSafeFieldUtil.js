/**
 * @param {Object} object - Đối tượng gốc (thường là req.body)
 * @param {Array} keys - Danh sách các trường được phép giữ lại
 * @returns {Object} - Đối tượng mới chỉ chứa các trường hợp lệ
 */
export const pickSafeFields = (object, keys) => {
    return keys.reduce((obj, key) => {
        // Chỉ lấy nếu key tồn tại trong object gốc
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            obj[key] = object[key]
        }
        return obj
    }, {})
}