/**
 * Middleware chống tấn công NoSQL Injection
 * Loại bỏ các ký tự đặc biệt ($ và .) khỏi req.body, req.query và req.params
 */
import { REGEXP } from '#constants/regexp.js'

const mongoSanitize = (req, res, next) => {
    const clean = (obj) => {
        if (obj !== null && typeof obj === 'object') {
            Object.keys(obj).forEach((key) => {
                if (key.startsWith(REGEXP.NOSQL_CHARS.DOLLAR) || key.includes(REGEXP.NOSQL_CHARS.DOT)) {
                    delete obj[key]
                } else if (typeof obj[key] === 'object') {
                    clean(obj[key])
                }
            })
        }
    }

    clean(req.body)
    clean(req.query)
    clean(req.params)

    next()
}

export default mongoSanitize
