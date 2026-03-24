import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import redisClient from '#configs/redis.js';

import { env } from '#configs/environment.js'
import { COMMON_CONSTANTS } from '#constants/common.js'
import { ERROR_CODES } from '#constants/errorCode.js'
import { RefreshToken } from '#models/refreshTokenModel.js'
import { USER_REPOSITORY } from '#repositories/userRepository.js'
import ApiError from '#utils/ApiError.js'

export const authService = {
    /**
     * @description Tạo payload chuẩn cho Access Token
     * Senior Fullstack: DRY Principle
     */
    _generateAccessTokenPayload: (user) => {
        return {
            userId: user._id.toString(),
            role: user.role,
            shopId: user.shopId ? user.shopId.toString() : null,
            branchId: user.branchId ? user.branchId.toString() : null,
            managedBranches: (user.managedBranches || []).map(id => id.toString())
        };
    },

    register: async (data) => {
        const { email, password, fullName, phone } = data
        const existingUser = await USER_REPOSITORY.findByEmail(email)
        if (existingUser) throw new ApiError(ERROR_CODES.EMAIL_ALREADY_EXISTS)

        const newUser = await USER_REPOSITORY.create({
            email,
            password,
            fullName,
            phone
        })

        newUser.password = undefined
        return newUser
    },

    login: async (email, password, deviceInfo = {}) => {
        // 1. Kiểm tra Account Lockout (DoS/Brute-force protection)
        const lockoutKey = `lockout:${email}`;
        const attempts = await redisClient.get(lockoutKey);
        if (attempts && parseInt(attempts) >= 5) {
            throw new ApiError(ERROR_CODES.ACCOUNT_LOCKED, ['Tài khoản tạm thời bị khóa. Vui lòng thử lại sau 15 phút.']);
        }

        const user = await USER_REPOSITORY.findByEmail(email)
        if (!user) throw new ApiError(ERROR_CODES.INVALID_CREDENTIALS)

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            await redisClient.set(lockoutKey, parseInt(attempts || 0) + 1, { EX: 15 * 60 });
            throw new ApiError(ERROR_CODES.INVALID_CREDENTIALS)
        }

        await redisClient.del(lockoutKey);

        // 2. Cấp Access & Refresh tokens
        const accessToken = jwt.sign(
            authService._generateAccessTokenPayload(user),
            env.JWT_ACCESS_SECRET,
            { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
        )

        const refreshToken = jwt.sign(
            { userId: user._id },
            env.JWT_REFRESH_SECRET,
            { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
        )

        const decodedRefresh = jwt.decode(refreshToken)
        const expiresAt = new Date(decodedRefresh.exp * 1000)

        // 3. Quản lý phiên đăng nhập (Session Management)
        const sessionCount = await RefreshToken.countDocuments({ userId: user._id });
        if (sessionCount >= 5) {
            const oldestSession = await RefreshToken.findOne({ userId: user._id }).sort({ updatedAt: 1 });
            if (oldestSession) await RefreshToken.deleteOne({ _id: oldestSession._id });
        }

        const ip = (deviceInfo.ipAddress === '::1' || deviceInfo.ipAddress === '::ffff:127.0.0.1')
            ? COMMON_CONSTANTS.LOCAL_IP
            : deviceInfo.ipAddress

        await RefreshToken.findOneAndUpdate(
            { userId: user._id, ipAddress: ip, userAgent: deviceInfo.userAgent },
            {
                token: refreshToken,
                expiresAt,
                isRevoked: false
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        return {
            user: {
                _id: user._id.toString(),
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                shopId: user.shopId ? user.shopId.toString() : null,
                branchId: user.branchId ? user.branchId.toString() : null,
                managedBranches: (user.managedBranches || []).map(id => id.toString())
            },
            accessToken,
            refreshToken
        }
    },

    refreshToken: async (token) => {
        if (!token) throw new ApiError(ERROR_CODES.UNAUTHORIZED, ['Không có Refresh Token'])

        const savedToken = await RefreshToken.findOne({ token })
        if (!savedToken || savedToken.isRevoked) {
            throw new ApiError(ERROR_CODES.INVALID_REFRESH_TOKEN, ['Phiên đăng nhập không hợp lệ hoặc đã hết hạn'])
        }

        try {
            const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET)
            const user = await USER_REPOSITORY.findById(decoded.userId)
            if (!user) throw new ApiError(ERROR_CODES.UNAUTHORIZED)

            // Token Rotation
            const newAccessToken = jwt.sign(
                authService._generateAccessTokenPayload(user),
                env.JWT_ACCESS_SECRET,
                { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
            )

            const newRefreshToken = jwt.sign(
                { userId: user._id },
                env.JWT_REFRESH_SECRET,
                { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
            )

            const decodedNewRefresh = jwt.decode(newRefreshToken)
            savedToken.token = newRefreshToken
            savedToken.expiresAt = new Date(decodedNewRefresh.exp * 1000)
            await savedToken.save()

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: {
                    _id: user._id.toString(),
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    shopId: user.shopId ? user.shopId.toString() : null,
                    branchId: user.branchId ? user.branchId.toString() : null,
                    managedBranches: (user.managedBranches || []).map(id => id.toString())
                }
            }
        } catch (error) {
            await RefreshToken.deleteOne({ token })
            throw new ApiError(ERROR_CODES.INVALID_REFRESH_TOKEN)
        }
    },

    logout: async (refreshToken, accessToken) => {
        if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken })

        // Blacklisting Access Token bằng Redis
        if (accessToken) {
            const decoded = jwt.decode(accessToken);
            if (decoded && decoded.exp) {
                const ttl = decoded.exp - Math.floor(Date.now() / 1000);
                if (ttl > 0) {
                    await redisClient.set(`blacklist:${accessToken}`, '1', { EX: ttl });
                }
            }
        }
        return { success: true }
    },

    getSessions: async (userId) => {
        return await RefreshToken.find({ userId }).select('-token').sort({ createdAt: -1 }).lean()
    },

    logoutAll: async (userId) => {
        await RefreshToken.deleteMany({ userId })
        return { success: true }
    },

    logoutDevice: async (userId, sessionId) => {
        await RefreshToken.deleteOne({ _id: sessionId, userId })
        return { success: true }
    }
}