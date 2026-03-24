/**
 * Chuyển đổi định dạng thời gian (vd: '15m', '2h', '1d') thành số phút.
 * @param {string} ttlString - Chuỗi thời gian
 * @returns {number} Số phút
 */
export const parseTokenTTL = (ttlString) => {
    if (!ttlString) return 15 // Mặc định 15 phút nếu quên config

    // Tách số và đơn vị (s: giây, m: phút, h: giờ, d: ngày)
    const match = ttlString.match(/^(\d+)([smhd])$/)
    if (!match) return parseInt(ttlString, 10) || 15

    const value = parseInt(match[1], 10)
    const unit = match[2]

    switch (unit) {
        case 's': return value / 60
        case 'm': return value
        case 'h': return value * 60
        case 'd': return value * 24 * 60
        default: return value
    }
}