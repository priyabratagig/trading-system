const router = require("express").Router()
const { log, HTTP } = require('../utils')
const path = require('path')
const fs = require('fs')

router.get('/all', (req, res) => {
    const http = new HTTP(req, res)
    try {
        fs.readdir(log.directory, (err, files) => {
            if (err) {
                log.error(`Log.handler : /logs/all : ${err.message}`)
                return http.send_message(500, err.message)
            }

            return http.send_json(200, files)
        })
    } catch ({ message }) {
        log.error(`Log.handler : /logs/all : ${message}`)

        return http.send_message(500, message)
    }
})


router.get('/download/:filename', (req, res) => {
    const http = new HTTP(req, res)
    try {
        const filename = req.params.filename
        const filePath = path.join(log.directory, filename)

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                log.error(`Log.handler : /logs/download/:filename : ${err.message}`)
                return http.send_message(500, err.message)
            }

            return http.send_file(200, filePath, (err) => {
                if (err) {
                    log.error(`Log.handler : /logs/download/:filename : ${err.message}`)
                    return http.send_message(500, err.message)
                }
            })
        })
    } catch ({ message }) {
        log.error(`Log.handler : /logs/download/:filename : ${message}`)

        return http.send_message(500, message)
    }
})

module.exports = router