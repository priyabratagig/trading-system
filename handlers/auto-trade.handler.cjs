const router = require("express").Router()
const { log, HTTP, Twilio } = require('../utils')

router.get('/on', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        log.info('AutoTrade.handler : /auto-trade/ON')

        Twilio.Send_WhatsApp_Message(
            `AutoTrade.handler : /auto-trade/ON : AutoTrade ON`
        ).catch(({ message }) => {
            log.error(`AutoTrade.handler : /auto-trade/ON : ${message}`)
        })

        process.env.AUTO_TRADE = 'ON'

        return http.send_message(200, 'AutoTrade ON')
    }
    catch ({ message }) {
        log.error(`AutoTrade.handler : /auto-trade/ON : ${message}`)

        return http.send_message(400, message)
    }
})

router.get('/off', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        log.info('AutoTrade.handler : /auto-trade/OFF')

        Twilio.Send_WhatsApp_Message(
            `AutoTrade.handler : /auto-trade/OFF : AutoTrade OFF`
        ).catch(({ message }) => {
            log.error(`AutoTrade.handler : /auto-trade/OFF : ${message}`)
        })

        process.env.AUTO_TRADE = 'OFF'

        return http.send_message(200, 'AutoTrade OFF')
    }
    catch ({ message }) {
        log.error(`AutoTrade.handler : /auto-trade/OFF : ${message}`)

        return http.send_message(400, message)
    }
})

router.get('/get-status', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        log.info('AutoTrade.handler : /auto-trade/status')

        const status = process.env.AUTO_TRADE == 'ON'

        return http.send_json(200, { status })
    }
    catch ({ message }) {
        log.error(`AutoTrade.handler : /auto-trade/status : ${message}`)

        return http.send_message(400, message)
    }
})

module.exports = router