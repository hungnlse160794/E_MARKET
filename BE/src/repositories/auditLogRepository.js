import { AuditLog } from '#models/auditLogModel.js'

export const AUDITLOG_REPOSITORY = {
    /**
     * Khởi tạo log record khi request bắt đầu
     * @param {Object} logData - Dữ liệu request (user, method, endpoint, body, ip, ...)
     * @returns {Promise<Object>} - Record đã tạo (chứa _id)
     */
    createLog: async (logData) => {
        // Repository chỉ làm nhiệm vụ thực thi lệnh DB
        const newLog = new AuditLog(logData)
        return await newLog.save()
    },

    /**
     * Cập nhật thông tin response và duration sau khi request kết thúc
     * @param {String} logId - ID của log record cần cập nhật
     * @param {Object} updateData - Dữ liệu response (status, body, duration)
     * @returns {Promise<Object>}
     */
    updateLog: async (logId, updateData) => {
        if (!logId) return null

        return await AuditLog.findByIdAndUpdate(
            logId,
            { $set: updateData },
            { new: true } // Trả về data sau khi update
        )
    },

    /**
     * Tìm kiếm log (Dành cho Admin sau này check lịch sử)
     */
    findLogs: async (filter = {}, options = { limit: 50, skip: 0 }) => {
        return await AuditLog.find(filter)
            .populate('user', 'fullName email role') // Lấy thêm info user cho dễ nhìn
            .sort({ createdAt: -1 })
            .limit(options.limit)
            .skip(options.skip)
    },

    /**
     * Lấy chi tiết 1 log
     */
    getLogDetail: async (logId) => {
        return await AuditLog.findById(logId).populate('user', 'fullName email')
    }
}