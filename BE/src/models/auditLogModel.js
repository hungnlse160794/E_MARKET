import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { COMMON_CONSTANTS } from '#constants/common.js'

const auditLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    method: String,
    endpoint: String,
    request: {
        body: Object,
        params: Object,
        query: Object
    },
    response: {
        status: Number,
        body: Object
    },
    ip: String,
    userAgent: String,
    duration: Number
}, { timestamps: true })

// TTL Index: Tự động xóa bản ghi theo cấu hình Retention Days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: COMMON_CONSTANTS.RETENTION_DAYS * 24 * 60 * 60 })
auditLogSchema.index({ createdAt: -1 })

auditLogSchema.plugin(mongoosePaginate)

export const AuditLog = mongoose.model('AuditLog', auditLogSchema)