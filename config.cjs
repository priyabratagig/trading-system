const DEV = process.env.MODE == 'DEV'
const PROD = process.env.MODE == 'PROD'

const APP_ID = process.env.APP_ID
const SECRET_KEY = process.env.SECRET_KEY
const APP_ID_HASH = process.env.APP_ID_HASH
const USER_PIN = process.env.USER_PIN

const ACCESS_TOKEN_VALIDITY = parseInt(process.env.ACCESS_TOKEN_VALIDITY, 10)
const REFRESH_TOKEN_VALIDITY = parseInt(process.env.REFRESH_TOKEN_VALIDITY, 10)

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY
const COOCKIE_SECRET = process.env.COOCKIE_SECRET
const COOCKIE_EXPIRY = parseInt(process.env.COOCKIE_EXPIRY, 10)

const USERNAME = process.env.LOGIN_USERNAME
const PASSWORD = process.env.LOGIN_PASSWORD

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_SENDER_NUMBER = process.env.TWILIO_SENDER_NUMBER
const TWILIO_RECEIVER_NUMBER = process.env.TWILIO_RECEIVER_NUMBER

const MONGODB_USER = process.env.MONGODB_USER
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD
const MONGODB_CLUSTER = process.env.MONGODB_CLUSTER
const MONGODB_DBNAMNE = process.env.MONGODB_DBNAMNE
const MONGODB_HOST = process.env.MONGODB_HOST
const MONGODB_PORT = parseInt(process.env.MONGODB_PORT)
const MONGODB_URI = DEV ?
    `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DBNAMNE}?retryWrites=true&w=majority` :
    `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}.mongodb.net/${MONGODB_DBNAMNE}?retryWrites=true&w=majority`

const SEVER_IP = process.env.IP
const SERVER_PORT = parseInt(process.env.SERVER_PORT, 10)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN

const API_ROOT = process.env.API_ROOT

const SIDE = Object.freeze({
    BUY: 1,
    SELL: -1
})
const POSITION = Object.freeze({
    LONG: 1,
    SHORT: -1,
    CLOSED: 0
})
const STATUS = Object.freeze({
    CANCELLED: 1,
    FILLED: 2,
    TRANSIST: 4,
    REJECTED: 5,
    PENDING: 6,
    EXPIRED: 7
})
const TYPE = Object.freeze({
    LIMIT: 1,
    MARKET: 2,
    STOP_MARKET: 3,
    STOP_LIMIT: 4
})
const SOURCE = Object.freeze({
    MOBILE: 'M',
    WEB: 'W',
    FYERS_ONE: 'R',
    ADMIN: 'A',
    API: 'ITS'
})

const SIDE_REV = Object.freeze(
    Object.assign(
        {},
        ...Object.entries(SIDE).map(([key, value]) => ({ [value]: key }))
    )
)
const STATUS_REV = Object.freeze(
    Object.assign(
        {},
        ...Object.entries(STATUS).map(([key, value]) => ({ [value]: key }))
    )
)

const TYPE_REV = Object.freeze(
    Object.assign(
        {},
        ...Object.entries(TYPE).map(([key, value]) => ({ [value]: key }))
    )
)

const BUY = 'BUY'
const SELL = 'SELL'

const LONG = 'LONG'
const SHORT = 'SHORT'
const CLOSED = 'CLOSED'

const PENDING = 'PENDING'
const WAITING = 'WAITING'
const TRANSIST = 'TRANSIST'
const FILLED = 'FILLED'
const EXITED = 'EXITED'
const CANCELLED = 'CANCELLED'
const REJECTED = 'REJECTED'
const EXPIRED = 'EXPIRED'

const LIMIT = 'LIMIT'
const MARKET = 'MARKET'
const STOP_MARKET = 'STOP_MARKET'
const STOP_LIMIT = 'STOP_LIMIT'

const MOBILE = 'MOBILE'
const WEB = 'WEB'
const FYERS_ONE = 'FYERS_ONE'
const ADMIN = 'ADMIN'
const API = 'API'

module.exports = {
    DEV,
    PROD,

    APP_ID,
    SECRET_KEY,
    APP_ID_HASH,
    USER_PIN,

    ACCESS_TOKEN_VALIDITY,
    REFRESH_TOKEN_VALIDITY,

    JWT_SECRET,
    JWT_EXPIRY,
    COOCKIE_SECRET,
    COOCKIE_EXPIRY,

    USERNAME,
    PASSWORD,

    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_SENDER_NUMBER,
    TWILIO_RECEIVER_NUMBER,

    MONGODB_URI,
    MONGODB_CLUSTER,
    MONGODB_PORT,
    MONGODB_DBNAMNE,

    SERVER_PORT,
    SEVER_IP,
    ALLOWED_ORIGIN,

    API_ROOT,

    SIDE,
    SIDE_REV,
    BUY,
    SELL,

    POSITION,
    LONG,
    SHORT,
    CLOSED,

    STATUS,
    STATUS_REV,
    WAITING,
    PENDING,
    FILLED,
    TRANSIST,
    CANCELLED,
    REJECTED,
    EXPIRED,
    EXITED,

    TYPE,
    TYPE_REV,
    LIMIT,
    MARKET,
    STOP_MARKET,
    STOP_LIMIT,

    SOURCE,
    MOBILE,
    WEB,
    FYERS_ONE,
    ADMIN,
    API
}