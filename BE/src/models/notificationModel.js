import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { COMMON_CONSTANTS } from '#constants/common.js';

const notificationSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { 
        type: String, 
        enum: Object.values(COMMON_CONSTANTS.NOTIFICATION_TYPE),
        required: true
    },
    isRead: { type: Boolean, default: false },
    data: Object // Lưu thông tin bổ sung như orderId để click vào xem
}, { timestamps: true });

notificationSchema.plugin(mongoosePaginate);

export const Notification = mongoose.model('Notification', notificationSchema);