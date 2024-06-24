const router = require("express").Router()
const { log, HTTP, Fyers } = require('../utils')

router.get('/get-login-link', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        log.info(`Token.handler : /token/get-login-link`)

        const auth_link = await Fyers.Generate_Login_Link()

        if (auth_link == -1) throw new Error('Error generating login link')

        return http.send_json(200, { auth_link })
    }
    catch ({ message }) {
        log.error(`Token.handler : /token/get-login-link : ${message}`)

        return http.send_message(500, message)
    }
})

router.post('/set-auth-code', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        log.info(`Token.handler : /token/set-auth-code`)

        const { auth_code } = req.body
        const result = await Fyers.Login(auth_code)

        if (result == -1) throw new Error('Error validating auth code')

        return http.send_message(200, "Fyers logged in successfully")
    }
    catch ({ message }) {
        log.error(`Token.handler : /token/set-auth-code : ${message}`)

        return http.send_message(500, message)
    }
})

router.get('/refresh-access-token', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        log.info(`Token.handler : /token/refresh-access-token`)

        const result = await Fyers.Refresh_Token()
        if (result == -1) throw new Error('Error refreshing access token')

        return http.send_message(200, 'Access token refreshed successfully')
    }
    catch ({ message }) {
        log.error(`Token.handler : /token/refresh-access-token : ${message}`)

        return http.send_message(500, message)
    }
})

router.get('/logout', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        log.info(`Token.handler : /token/logout`)

        Fyers.Logout()

        return http.send_message(200, 'Successfully logged out from fyers')
    }
    catch ({ message }) {
        log.error(`Token.handler : /token/logout : ${message}`)

        return http.send_message(500, message)
    }
})

module.exports = router