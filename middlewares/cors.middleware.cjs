const cors = require('cors');
const { ALLOWED_ORIGINS } = require('../config.cjs');

const corsOptions = {
    origin: (req_origin, callback) => {
        if (!req_origin) return callback(null, true) // Allow non-req_origin requests (e.g., from Postman)

        const req_host = new URL(req_origin).hostname
        const isAllowed = ALLOWED_ORIGINS.some(
            allowed_origin =>
                (req_host === allowed_origin) ||
                req_host.endsWith(`.${allowed_origin}`) ||
                (req_host === new URL(allowed_origin).hostname)
        )

        if (isAllowed) callback(null, true)
        else callback(new Error('Not allowed by CORS'))
    },
    credentials: true
}

module.exports = cors(corsOptions)