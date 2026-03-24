import dotenv from 'dotenv'

dotenv.config()

export const env = {
    // 1. Server Config
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5000',

    // 2. Database & Cache
    MONGODB_URI: process.env.MONGODB_URI,
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

    // 3. Security & Auth (JWT)
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'SaaS_Access_Secret_Key_Dev',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'SaaS_Refresh_Secret_Key_Dev',
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    // 4. Cloud Storage (Lưu ảnh/video)
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

    // 5. Payment Gateway (VNPay - Dành cho thanh toán ví/đơn hàng sau này)
    VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE,
    VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET,
    VNPAY_URL: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
}

if (!env.MONGODB_URI) {
    console.error('❌ CRITICAL ERROR: Thiếu biến môi trường MONGODB_URI!')
    process.exit(1)
}