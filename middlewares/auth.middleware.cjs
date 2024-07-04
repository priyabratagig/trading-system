const { JWT_SECRET, USERNAME, PASSWORD, API_ROOT } = require('../config.cjs')
const jwt = require('jsonwebtoken')
const { HTTP, log } = require("../utils")

const OPEN_ACCESS_ROUTES = [
    /^\/auth\/(login|logout)/i,
    /\/alert\/chartink$/i,
    /\/order\/webhook$/i,
    /^\/login/i,
    /^\/assets\//i
]

const authenticate = (req, res, next) => {
    const http = new HTTP(req, res, next)
    try {
        if (OPEN_ACCESS_ROUTES.some(route => route.test(req.url.split(API_ROOT)?.pop()))) return next()
        //if (OPEN_ACCESS_ROUTES.some(route => route.test(req.url))) return next()

        if (!req.signedCookies?.access_token) throw new Error('Unauthorized access')

        const token = jwt.verify(req.signedCookies.access_token, JWT_SECRET, (err, token) => {
            if (err) throw new Error(`Cannot authenticate, ${err.message}`)

            const { USERNAME, PASSWORD } = token

            return { USERNAME, PASSWORD }
        })

        if (token.USERNAME !== USERNAME || token.PASSWORD !== PASSWORD) throw new Error('Unauthorized access')

        return next()
    } catch ({ message }) {
        log.auth.error(`Auth.middleware : authenticate : ${message}, ${req.method}:${req.url} by ${req.ip}, payload: ${JSON.stringify(req.body) || "''"}, user-agent: ${req.headers['user-agent']}`)

        if (req.url.includes(API_ROOT)) return http.send_message(401, message)
        return http.redirect(401, '/login')
    }
}

module.exports = authenticate