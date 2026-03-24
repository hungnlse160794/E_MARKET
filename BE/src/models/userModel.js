import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { COMMON_CONSTANTS } from '#constants/common.js';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    fullName: { type: String, required: true },
    phone: { type: String, trim: true },
    avatar: { type: String, default: '' },
    role: {
        type: String,
        enum: Object.values(COMMON_CONSTANTS.USER_ROLE),
        default: COMMON_CONSTANTS.USER_ROLE.CUSTOMER
    },
    // Phân quyền cho mô hình SaaS Đa chi nhánh
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },

    // Role-based management scope
    // SHOP_OWNER: quản lý shopId chính
    // BRANCH_MANAGER: quản lý danh sách các chi nhánh trong managedBranches
    managedBranches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
    status: {
        type: String,
        enum: Object.values(COMMON_CONSTANTS.USER_STATUS),
        default: COMMON_CONSTANTS.USER_STATUS.ACTIVE
    },
    is2FAEnabled: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    
    try {
        const salt = await bcrypt.genSalt(COMMON_CONSTANTS.BCRYPT_SALT_ROUNDS || 10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.plugin(mongoosePaginate);

export const User = mongoose.model('User', userSchema);