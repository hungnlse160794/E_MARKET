import mongoose from 'mongoose';
import { env } from '#configs/environment.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Dừng server ngay lập tức nếu không kết nối được DB
    }
};

export default connectDB;
