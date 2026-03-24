const SENSITIVE_FIELDS = ['password', 'token', 'accessToken', 'refreshToken', 'oldPassword', 'secret', 'newPassword']

const sanitize = (data) => {
    if (!data || typeof data !== 'object') return data

    const cleanData = Array.isArray(data) ? [...data] : { ...data }

    Object.keys(cleanData).forEach(key => {
        if (SENSITIVE_FIELDS.includes(key)) {
            cleanData[key] = '***MASKED***'
        } else if (typeof cleanData[key] === 'object') {
            cleanData[key] = sanitize(cleanData[key])
        }
    })

    return cleanData
}

export default sanitize