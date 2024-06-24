const { USERNAME, PASSWORD, JWT_SECRET, JWT_EXPIRY, COOCKIE_EXPIRY } = require('../config.cjs')
const router = require("express").Router()
const jwt = require('jsonwebtoken')
const { HTTP, log, Twilio, DateTime } = require('../utils')

router.post('/login', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        const { username, password } = req.body
        if (!username || !password) throw new Error('Must provide username and password')

        Twilio.Send_WhatsApp_Message(
            `Login attempted at ${DateTime.To_String().split(' GMT')[0]}`
        ).catch(_ => og.error(`Auth.handler : /auth/login : Error sending whatsapp message`))

        if (username !== USERNAME || password !== PASSWORD) throw new Error('Invalid credentials')

        const access_token = jwt.sign(
            { USERNAME, PASSWORD },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        )

        return http
            .set_cookie('access_token', access_token, { maxAge: COOCKIE_EXPIRY, httpOnly: true, signed: true })
            .send_message(200, "Logged-in successfully")
    }
    catch ({ message }) {
        log.error(`Auth.handler : /auth/login : ${message}`)

        return http.send_message(400, message)
    }
})

router.get('/logout', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        return http.delete_cookie('access_token').send_message(200, "Successfully logged-out")
    }
    catch ({ message }) {
        log.error(`Auth.handler : /auth/logout : ${message}`)

        return http.send_message(400, message)
    }
})

module.exports = router