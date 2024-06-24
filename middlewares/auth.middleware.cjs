const { JWT_SECRET, USERNAME, PASSWORD } = require('../config.cjs')
const jwt = require('jsonwebtoken')
const { HTTP, log } = require("../utils")

const OPEN_ACCESS_ROUTES = [
    /\/alert\/chartink$/i,
    /\/order\/webhook$/i
]

const authenticate = (req, res, next) => {
    const http = new HTTP(req, res, next)
    try {
        if (OPEN_ACCESS_ROUTES.some(route => route.test(req.url))) return next()

        if (!req.signedCookies?.access_token) throw new Error('Unauthorized access')

        const token = jwt.verify(req.signedCookies.access_token, JWT_SECRET, (err, token) => {
            if (err) throw new Error(`Cannot authenticate, ${err.message}`)

            const { USERNAME, PASSWORD } = token

            return { USERNAME, PASSWORD }
        })

        if (token.USERNAME !== USERNAME || token.PASSWORD !== PASSWORD) throw new Error('Unauthorized access')

        return next()
    } catch ({ message }) {
        log.error(`Auth.middleware : authenticate : ${message}`)

        return http.send_message(403, message)
    }
}

module.exports = authenticate