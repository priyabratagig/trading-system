const router = require("express").Router()
const { Get_Funds } = require("../libs")
const { log, HTTP, Twilio } = require('../utils')

router.get('/start', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        process.env.SYSTEM_STATUS = "ON"

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

module.exports = router
