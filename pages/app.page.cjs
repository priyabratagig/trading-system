const router = require('express').Router()
const path = require("path")
const { API_ROOT } = require("../config.cjs")
const { HTTP, log } = require('../utils')

router.all('*', async (req, res, next) => {
    const http = new HTTP(req, res, next);
    try {
        if (req.url.includes(API_ROOT)) return next()

        const indexPath = path.resolve(__dirname, '..', 'dist', 'index.html')
        return http.send_page(200, indexPath)

    } catch ({ message }) {
        log.error(`App.page : ${message}`);

        return http.send_message(400, message);
    }
})

module.exports = router