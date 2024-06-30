const { ALLOWED_ORIGINS, PROD } = require('../config.cjs')
const cors = require('cors')
const { log, HTTP } = require('../utils')

const cors_options = {
    origin: (req_origin, callback) => {
        try {
            if (!req_origin) {
                if (PROD) throw new Error('origin not provided')
                return callback(null, true)
            }

            const req_host = new URL(req_origin).hostname // sub.example.com
            const isAllowed = ALLOWED_ORIGINS.includes(req_host)
            if (!isAllowed) throw new Error(`${req_origin} is blocked`)

            return callback(null, true)
        } catch (err) {
            log.error(`Cors.middleware : origin : ${err.message}`)

            return callback(err, false)
        }
    },
    credentials: true
}

const cors_middleware = (req, res, next) => {
    const http = new HTTP(req, res, next)
    try {
        return cors(cors_options)(req, res, (err) => {
            if (err) return http.send_message(403, `Access Blocked by CORS policy, ${err.message}`)
            else return next()
        })
    }
    catch (err) {
        log.error(`Cors.middleware : cors_middleware : ${err.message}`)

        return http.send_message(500, 'Internal Server Error')
    }
}

module.exports = cors_middleware