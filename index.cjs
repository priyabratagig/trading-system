const { SERVER_PORT, SEVER_IP, MONGODB_URI, MONGODB_PORT, MONGODB_CLUSTER, MONGODB_DBNAMNE, COOCKIE_SECRET, ALLOWED_ORIGIN, PROD } = require('./config.cjs')
const express = require('express')
const json_parser = express.json
const mongoose = require('mongoose')
const cookie_parser = require('cookie-parser')
const cors = require('cors')

const authenticate = require('./middlewares/auth.middleware.cjs')

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
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }))
app.use(cookie_parser(COOCKIE_SECRET))
app.use(authenticate)
app.use(json_parser())
app.use('/token', token)
app.use('/alert', alert)
app.use('/idea', idea)
app.use('/funds', funds)
app.use('/order', order)
app.use('/logs', logs)

try {
    app.listen(SERVER_PORT, () => {
        console.log(`Server is running on port ${SERVER_PORT}`)
        console.log(`local: http://localhost:${SERVER_PORT}/`)
        console.log(`public: http://${SEVER_IP}:${SERVER_PORT}`)
    })

    mongoose.connect(MONGODB_URI)
        .then(() => {
            if (PROD) console.log(`Connected to MongoDB on port ${MONGODB_PORT} db ${MONGODB_DBNAMNE}`)
            else console.log(`Connected to MongoDB on ${MONGODB_CLUSTER} db ${MONGODB_DBNAMNE}`)
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