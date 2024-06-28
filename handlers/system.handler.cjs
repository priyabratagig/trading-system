const router = require("express").Router()
const { log, HTTP, Twilio } = require('../utils')

router.get('/start', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        process.env.SYSTEM_STATUS = "ON"

        log.info(`System.handler : /system/start : System started`)

        Twilio.Send_WhatsApp_Message(
            `System.handler : /system/start : System started`
        ).catch(_ => log.error(`System.handler : /system/start : Error sending whatsapp message`))

        return http.send_message(200, "System started")
    }
    catch ({ message }) {
        log.error(`System.handler : /system/start : ${message}`)

        Twilio.Send_WhatsApp_Message(
            `System.handler : /system/start : Cannot srart the system`
        ).catch(_ => log.error(`System.handler : /system/start : Error sending whatsapp message`))

        return http.send_message(400, "Can not start the system")
    }
})

router.get('/stop', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        process.env.SYSTEM_STATUS = "OFF"

        log.info(`System.handler : /system/stop : System stopped`)

        Twilio.Send_WhatsApp_Message(
            `System.handler : /system/stop : System stopped`
        ).catch(_ => log.error(`System.handler : /system/stop : Error sending whatsapp message`))

        return http.send_message(200, "System stopped")
    }
    catch ({ message }) {
        log.error(`System.handler : /system/stop : ${message}`)

        Twilio.Send_WhatsApp_Message(
            `System.handler : /system/stop : Cannot stop the system`
        ).catch(_ => log.error(`System.handler : /system/stop : Error sending whatsapp message`))

        return http.send_message(400, "Can not start the system")
    }
})

router.get('/get-status', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        log.info(`System.handler : /system/get-status`)

        const status = process.env.SYSTEM_STATUS == 'ON'

        return http.send_json(200, { status })
    }
    catch ({ message }) {
        log.error(`System.handler : /system/get-status : ${message}`)

        return http.send_message(400, "Can not get the system status")
    }
})

module.exports = router
