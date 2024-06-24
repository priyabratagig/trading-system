const router = require("express").Router()
const { Alert } = require('../models')
const { log, HTTP, DateTime } = require('../utils')
const { Generate_Ideas } = require('../jobs')

router.post('/chartink', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        let { stocks, triggered_at } = req.body
        if (typeof stocks != "string" || stocks.length < 1) throw new Error(`/alert/chartink : No stocks, stocks= ${stocks}`)

        log.info(`Alert.handler : /alert/chartink`)

        const time = DateTime.TimeNum_From_12H(triggered_at)
        const today = DateTime.DateNum_Today()
        const datetime = today + time
        stocks = stocks.split(',')
        alters = stocks.map(stock => ({ symbol: stock, time: datetime }))

        const result = await Alert.insertMany(alters)
        if (!result || result == -1) throw new Error(`Alerts not saved, alerts= ${JSON.stringify(alerts)}`)
        Generate_Ideas(alters)

        return http.send_status(200)
    }
    catch ({ message }) {
        log.error(`Alert.handler : /alert/chartink : ${message}`)

        return http.send_status(200)
    }
})

module.exports = router