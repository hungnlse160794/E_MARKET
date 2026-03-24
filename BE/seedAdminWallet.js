import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/e_market';

// Định nghĩa schema tại chỗ để tránh lỗi import/validation phức tạp
const walletSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    balance: { type: Number, default: 0 },
    frozenBalance: { type: Number, default: 0 },
    isSystemWallet: { type: Boolean, default: false },
    bankInfo: {
        bankName: String,
        accountHolder: String,
        accountNumber: String
    }
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);

async function seed() {
    try {
        console.log('Connecting to:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const existingSystemWallet = await Wallet.findOne({ isSystemWallet: true });
        if (existingSystemWallet) {
            console.log('System Wallet already exists:', existingSystemWallet._id);
            process.exit(0);
        }

        const systemWallet = await Wallet.create({
            isSystemWallet: true,
            balance: 0,
            frozenBalance: 0,
            bankInfo: {
                bankName: 'Vietcombank',
                accountHolder: 'E-MARKET PLATFORM',
                accountNumber: '999988887777'
            }
        });

        console.log('System Wallet created successfully:', systemWallet._id);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding system wallet:', error);
        process.exit(1);
    }
}

seed();
