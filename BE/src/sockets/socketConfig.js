import { Server } from 'socket.io';
import { env } from '#configs/environment.js';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] Khách kết nối: ${socket.id}`);

        // Join theo userId khi khách đăng nhập (Giúp gửi đúng người)
        socket.on('join', (userId) => {
            if (userId) {
                socket.join(userId.toString());
                console.log(`[Socket] User ${userId} đã tham gia Room cá nhân.`);
            }
        });

        // Join room theo Shop (Cho nhân viên shop nhận đơn mới)
        socket.on('join_shop', (shopId) => {
            if (shopId) {
                socket.join(`shop_${shopId}`);
                console.log(`[Socket] Staff đã tham gia Room Shop_${shopId}.`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Khách ngắt kết nối: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io must be initialized first!');
    }
    return io;
};
