import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

// Cuộc hội thoại
const conversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', index: true },
    isOpen: { type: Boolean, default: true }
}, { timestamps: true })

conversationSchema.plugin(mongoosePaginate)
export const Conversation = mongoose.model('Conversation', conversationSchema)

// Tin nhắn chi tiết
const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true }
}, { timestamps: true })

messageSchema.plugin(mongoosePaginate)
export const Message = mongoose.model('Message', messageSchema)