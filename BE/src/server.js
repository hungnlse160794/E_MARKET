import express from 'express'
import http from 'http'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

// Import Configs & Utils
import { env } from '#configs/environment.js'
import { COMMON_CONSTANTS } from '#constants/common.js'
import connectDB from '#configs/db.js'
import { corsOptions } from '#configs/cors.js'
import { setupSwagger } from '#configs/swagger.js'

// Import Middlewares & Routes
import auditLogMiddleware from '#middlewares/auditLogMiddleware.js'
import { errorHandlingMiddleware, notFoundHandler } from '#middlewares/errorHandlingMiddleware.js'
import mongoSanitize from '#middlewares/mongoSanitizeMiddleware.js'
import v1Router from '#routes/v1/index.js'
import { initCleanupJobs } from '#jobs/cleanupJob.js'
import { initSocket } from '#sockets/socketConfig.js'

// 1. Khởi tạo Express App & HTTP Server
const app = express()
const server = http.createServer(app)

// Cấu hình trust proxy để lấy IP thật của Client khi qua load balancer/proxy (Reverse Proxy)
// Quan trọng cho Rate Limiting
app.set('trust proxy', true)

// 2. Kết nối Database
connectDB()

// 3. Cấu hình Swagger API Documentation (Đặt trước các middleware bảo mật để dễ test)
setupSwagger(app)

// 4. Global Middlewares (Lớp áo giáp bảo vệ)
app.use(helmet()) // Bảo vệ HTTP Headers
app.use(cors(corsOptions)) // Xử lý CORS
app.use(express.json({ limit: COMMON_CONSTANTS.BODY_SIZE_LIMIT })) // Parse JSON body
app.use(express.urlencoded({ extended: true, limit: COMMON_CONSTANTS.BODY_SIZE_LIMIT }))
app.use(cookieParser()) // Phân tích Cookie
app.use(mongoSanitize) // Chống NoSQL Injection (Đặt sau body-parser)

if (env.NODE_ENV === 'dev') {
    app.use(morgan('dev')) // Ghi log request ra console
}

// 5. Middleware theo dõi luồng (Audit Log)
// Đặt ở đây để ghi nhận mọi request đi vào API
app.use('/api', auditLogMiddleware)

// 6. Test Route cơ bản (Health Check)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SaaS E-commerce API is running smoothly! 🚀',
        timestamp: new Date().toISOString()
    })
})

// 7. Định tuyến API (Master Route)
app.use('/api/v1', v1Router)

// 8. Bắt lỗi Route không tồn tại (404)
app.use(notFoundHandler)

// 9. Bắt lỗi tập trung toàn hệ thống (Phải nằm cuối cùng)
app.use(errorHandlingMiddleware)

// 10. Khởi động Server
server.listen(env.PORT, () => {
    console.log(`🚀 Server is running in [${env.NODE_ENV}] mode on port ${env.PORT}`)
    
    // Khởi tạo Sockets
    initSocket(server)

    // Khởi chạy các công việc dọn dẹp định kỳ (Cron Jobs)
    initCleanupJobs()
})

// === 11. Graceful Shutdown (Xử lý tắt Server an toàn) ===
// Bắt các lỗi không được try-catch (Promise Rejection)
process.on('unhandledRejection', (err) => {
    console.error('💥 UNHANDLED REJECTION! Shutting down...')
    console.error(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})

// Đóng server an toàn khi bị tắt bằng Ctrl+C (SIGINT) hoặc kill process (SIGTERM)
const exitHandler = () => {
    if (server) {
        server.close(() => {
            console.log('💤 Server closed gracefully.')
            process.exit(1)
        })
    } else {
        process.exit(1)
    }
}

process.on('SIGTERM', exitHandler)
process.on('SIGINT', exitHandler)