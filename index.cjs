const { SERVER_PORT, SEVER_IP, MONGODB_URI, MONGODB_PORT, MONGODB_CLUSTER, MONGODB_DBNAMNE, COOCKIE_SECRET, API_ROOT, MONGODB_INSTANCE_LOCAL, DEV, MONGODB_INSTANCE_ATLAS } = require('./config.cjs')
const express = require('express')
const json_parser = express.json
const mongoose = require('mongoose')
const cookie_parser = require('cookie-parser')
const path = require('path')

const authenticate = require('./middlewares/auth.middleware.cjs')
const usecors = require('./middlewares/cors.middleware.cjs')

const webapp = require('./pages/app.page.cjs')
const webapp_static = path.resolve(__dirname, 'dist')

const system = require('./handlers/system.handler.cjs')
const auto_trade = require('./handlers/auto-trade.handler.cjs')
const auth = require('./handlers/auth.handler.cjs')
const token = require('./handlers/token.handler.cjs')
const alert = require('./handlers/alert.handler.cjs')
const idea = require('./handlers/idea.handler.cjs')
const funds = require('./handlers/funds.handler.cjs')
const order = require('./handlers/order.handler.cjs')
const logs = require('./handlers/logs.handler.cjs')

const Subscribe_Orber_Jobs = require('./jobs/order.job.cjs')
const Subscribe_Fyers_Job = require('./jobs/fyers.job.cjs')
const Subscribe_Price_Monitor = require('./jobs/price_monitor.job.cjs')

const app = express()
app.use(usecors)
app.use(cookie_parser(COOCKIE_SECRET))
app.use(json_parser())
app.use(authenticate)
app.use(express.static(webapp_static))
app.use('/', webapp)
app.use(API_ROOT + '/system', system)
app.use(API_ROOT + '/auto-trade', auto_trade)
app.use(API_ROOT + '/auth', auth)
app.use(API_ROOT + '/token', token)
app.use(API_ROOT + '/alert', alert)
app.use(API_ROOT + '/idea', idea)
app.use(API_ROOT + '/funds', funds)
app.use(API_ROOT + '/order', order)
app.use(API_ROOT + '/logs', logs)

try {
    app.listen(SERVER_PORT, () => {
        if (DEV) {
            console.log('Server is running in development mode')
            console.log(`Server is running on port ${SERVER_PORT}`)
            console.log(`local: http://localhost:${SERVER_PORT}/`)
            console.log(`public: http://${SEVER_IP}:${SERVER_PORT}`)
        }
        else {
            console.log('Server is running in production mode')
            console.log(`Server is running on port ${SERVER_PORT}`)
            console.log(`public: http://${SEVER_IP}:${SERVER_PORT}`)
        }
    })

    mongoose.connect(MONGODB_URI)
        .then(() => {
            if (MONGODB_INSTANCE_ATLAS) console.log(`Connected to MongoDB on ${MONGODB_CLUSTER} db ${MONGODB_DBNAMNE}`)
            else console.log(`Connected to MongoDB on ${MONGODB_PORT} db ${MONGODB_DBNAMNE}`)
        })
        .catch((err) => {
            console.error(err.message)
        })

} catch (err) {
    console.error(err.message)
}

Subscribe_Orber_Jobs()
Subscribe_Fyers_Job()
Subscribe_Price_Monitor()