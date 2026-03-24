import { createClient } from 'redis';
import { env } from './environment.js';

const redisClient = createClient({
    url: env.REDIS_URL
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Redis Connected Successfully'));

// Tự động kết nối khi khởi tạo
await redisClient.connect();

export default redisClient;