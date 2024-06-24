const router = require("express").Router()
const { Get_Funds } = require("../libs")
const { log, HTTP } = require('../utils')

router.get('/get', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        log.info('Funds.handler : /funds/get')

        const funds = Get_Funds()
        return http.send_json(200, { funds })
    }
    catch ({ message }) {
        log.error(`Funds.handler : /funds/get : ${message}`)

        return http.send_message(400, message)
    }
})

module.exports = router