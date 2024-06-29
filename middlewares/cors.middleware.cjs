const { ALLOWED_ORIGINS, PROD } = require('../config.cjs')
const cors = require('cors')
const { log } = require('../utils')

const corsOptions = {
    origin: (req_origin, callback) => {
        try {
            if (!req_origin) {
                if (PROD) throw new Error('Origin not provided')
                return callback(null, true)
            }

            const req_host = new URL(req_origin).hostname // sub.example.com
            const isAllowed = ALLOWED_ORIGINS.includes(req_host)
            if (!isAllowed) throw new Error(`Origin ${req_origin} not allowed`)

            return callback(null, true)
        } catch (err) {
            log.error(`CORS.middleware : origin : error :${err.message}`)

            return callback(err, false)
        }
    },
    credentials: true
}

module.exports = cors(corsOptions)