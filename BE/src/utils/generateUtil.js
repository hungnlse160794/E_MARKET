import crypto from 'crypto'
import { env } from '#configs/environment.js'
import { REGEXP } from '#constants/regexp.js'
import { parseTokenTTL } from '#utils/parseTokenUtil.js'

const generateVerificationCode = () => {
    // Sinh mã OTP 6 số ngẫu nhiên
    return crypto.randomInt(100000, 999999).toString()
}

const generatePasswordResetToken = () => {
    // Sinh chuỗi an toàn URL-friendly
    return crypto.randomBytes(9).toString('base64url')
}

const expiresInMinutes = () => {
    const minutes = parseTokenTTL(env.OTP_EXPIRES_IN || '5m') // Gài thêm fallback
    return new Date(Date.now() + minutes * 60 * 1000)
}

const OTP_EXPIRES_IN_MINUTES = parseInt((env.OTP_EXPIRES_IN || '5m').replace(/\D/g, ''), 10)

// ⚡ 2 Hàm bóc tách Joi siêu việt của bạn ⚡
const extractFieldsFromJoi = (schema) => {
    const description = schema.describe()
    return Object.keys(description.keys || {})
}

const extractRequiredFieldsFromJoi = (schema) => {
    const description = schema.describe()
    return Object.entries(description.keys || {})
        // eslint-disable-next-line no-unused-vars
        .filter(([_, value]) => value.flags?.presence === 'required')
        .map(([key]) => key)
}


const generateSlug = (text) => {
    if (!text) return ''
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(REGEXP.SLUG.VIETNAMESE_ACCENTS, '')
        .replace(REGEXP.SLUG.NON_ALPHANUMERIC, '')
        .replace(REGEXP.SLUG.MULTIPLE_SPACES, '-')
        .replace(REGEXP.SLUG.TRIM_DASHES, '')
}

const generateRoomCode = (length = 6) => {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length).toUpperCase();
}

export const GENERATE_UTILS = {
    generateSlug,
    generateRoomCode,
    generatePasswordResetToken,
    generateVerificationCode,
    expiresInMinutes,
    OTP_EXPIRES_IN_MINUTES,
    extractFieldsFromJoi,
    extractRequiredFieldsFromJoi
}