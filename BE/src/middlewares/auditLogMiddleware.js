import { AUDITLOG_REPOSITORY } from '#repositories/auditLogRepository.js'
import sanitize from '#utils/sanitizeUtil.js'
import { formatResponseForAuditLog } from '#utils/auditUtil.js'
import { COMMON_CONSTANTS } from '#constants/common.js'

const auditLogMiddleware = async (req, res, next) => {
    const startTime = Date.now()
    const { SKIP_LOG_PATHS, LOG_METHODS, MAX_LOG_VALUE_LENGTH } = COMMON_CONSTANTS

    // 1. Bỏ qua các đường dẫn rác
    if (SKIP_LOG_PATHS.some(path => req.originalUrl.startsWith(path))) return next()
    
    // 2. Selective Logging: Chỉ log các method nhạy cảm (POST, PUT, DELETE...)
    // GET thường rất nhiều và không làm thay đổi dữ liệu nên ta sẽ skip để tối ưu
    if (!LOG_METHODS.includes(req.method)) return next()

    // 3. Hàm tiện ích cắt ngắn dữ liệu siêu lớn (base64, long text...)
    const truncate = (obj) => {
        if (!obj) return obj
        const newObj = JSON.parse(JSON.stringify(obj))
        for (const key in newObj) {
            if (typeof newObj[key] === 'string' && newObj[key].length > MAX_LOG_VALUE_LENGTH) {
                newObj[key] = `${newObj[key].substring(0, MAX_LOG_VALUE_LENGTH)}... [Truncated]`
            }
        }
        return newObj
    }

    const logData = {
        user: req.user?.userId || null,
        method: req.method,
        endpoint: req.originalUrl,
        request: { body: truncate(sanitize(req.body)), params: req.params, query: req.query },
        ip: req.ip,
        userAgent: req.headers['user-agent']
    }

    // Fire and forget: Tạo log record
    let logId = null
    AUDITLOG_REPOSITORY.createLog(logData)
        .then(log => { logId = log._id })
        .catch(err => console.error('AuditLog Create Error:', err.message))

    const originalJson = res.json.bind(res)
    res.json = function (body) {
        const duration = Date.now() - startTime
        if (logId) {
            AUDITLOG_REPOSITORY.updateLog(logId, {
                user: req.user?.userId || null, // Cập nhật lại user nếu auth diễn ra sau đó
                response: { status: res.statusCode, body: formatResponseForAuditLog(body) },
                duration
            }).catch(err => console.error('AuditLog Update Error:', err.message))
        }
        return originalJson(body)
    }

    next()
}

export default auditLogMiddleware