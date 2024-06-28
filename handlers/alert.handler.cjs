const router = require("express").Router()
const { Alert } = require('../models')
const { log, HTTP, DateTime } = require('../utils')
const { Generate_Ideas } = require('../jobs')

router.post('/chartink', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        if (process.env.SYSTEM_STATUS == "OFF") {
            log.info(`Alert.handler : /alert/chartink : recived alerts but system stopped`)

            return http.send_status(200)
        }

        let { stocks, triggered_at } = req.body
        if (typeof stocks != "string" || stocks.length < 1) throw new Error(`No stocks`)

        log.info(`Alert.handler : /alert/chartink`)

        const time = DateTime.TimeNum_From_12H(triggered_at)
        const today = DateTime.DateNum_Today()
        const datetime = today + time
        stocks = stocks.split(',')
        const alerts = stocks.map(stock => ({ symbol: stock, time: datetime }))

        const result = await Alert.insertMany(alerts)
        if (!result || result == -1) throw new Error(`Alerts not saved, alerts= ${JSON.stringify(alerts)}`)
        Generate_Ideas(alerts)

        return http.send_status(200)
    }
    catch ({ message }) {
        log.error(`Alert.handler : /alert/chartink : ${message}`)

        return http.send_status(200)
    }
})

module.exports = router