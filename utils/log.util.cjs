const { createLogger, transports, format } = require('winston')
const fs = require('fs')
const path = require('path')
const DateTime = require('./datetime.util.cjs')

const directory = path.join(__dirname, '..', 'logs')
const info_file = path.join(directory, 'app.info.log')
const error_file = path.join(directory, 'app.error.log')
const auth_file = path.join(directory, 'app.auth.log')
const orders_file = path.join(directory, 'app.orders.log')

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

const auht_logger_ifno = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: DateTime.Timestamp }),
        format.printf(({ timestamp, level, message }) => `${timestamp} :: ${level} :: ${message}`)
    ),
    transports: [
        //new transports.Console(),
        new transports.File({ filename: auth_file })
    ]
})
const auth_logger_error = createLogger({
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

const auth_error = (message) => {
    //console.error(message)
    auht_logger_ifno.error(message)
    auth_logger_error.error(message)
}
const auth_info = (message) => {
    //console.info(message)
    auht_logger_ifno.info(message)
}

const orders_logger_info = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: DateTime.Timestamp }),
        format.printf(({ timestamp, level, message }) => `${timestamp} :: ${level} :: ${message}`)
    ),
    transports: [
        //new transports.Console(),
        new transports.File({ filename: orders_file })
    ]
})
const orders_logger_error = createLogger({
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

const orders_error = (message) => {
    //console.error(message)
    orders_logger_info.error(message)
    orders_logger_error.error(message)
}
const orders_info = (message) => {
    //console.info(message)
    orders_logger_info.info(message)
}

module.exports = {
    directory,
    error, info, warn,
    auth: {
        error: auth_error,
        info: auth_info
    },
    orders: {
        error: orders_error,
        info: orders_info
    },
}