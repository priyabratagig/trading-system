const { createLogger, transports, format } = require('winston')
const fs = require('fs')
const path = require('path')
const DateTime = require('./datetime.util.cjs')

const directory = path.join(__dirname, '..', 'logs')
const info_file = path.join(directory, 'app.info.log')
const error_file = path.join(directory, 'app.error.log')

if (!fs.existsSync(directory)) fs.mkdirSync(directory)

const logger_info = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: DateTime.Timestamp }),
        format.printf(({ timestamp, level, message }) => `${timestamp} :: ${level} :: ${message}`)
    ),
    transports: [
        //new transports.Console(),
        new transports.File({ filename: info_file })
    ]
})

const logger_error = createLogger({
    level: 'error',
    format: format.combine(
        format.timestamp({ format: DateTime.Timestamp }),
        format.printf(({ timestamp, level, message }) => `${timestamp} :: ${level} :: ${message}`)
    ),
    transports: [
        //new transports.Console(),
        new transports.File({ filename: error_file })
    ]
})


const error = (message) => {
    //console.error(message)
    logger_info.error(message)
    logger_error.error(message)
}

const info = (message) => {
    //console.info(message)
    logger_info.info(message)
}

const warn = (message) => {
    //console.warn(message)
    //logger.warn(message)
}

module.exports = { error, info, warn, directory }