const router = require("express").Router()
const { log, HTTP, DateTime, Twilio } = require('../utils')
const { Order, Idea } = require('../models')
const { API, CANCELLED, REJECTED, EXPIRED, FILLED, TRANSIST, BUY, SIDE, EXITED, STATUS_REV, TYPE_REV, SIDE_REV, SOURCE_REV } = require('../config.cjs')
const { Get_All_Orders_Today, Place_Buy_Order, Place_Sell_Order, Place_Cancel_Order } = require("../libs")

router.post('/buy', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        const { idea_id, entry, target, stop, type, qty } = req.body

        log.info('Oder.handler : /order/buy')

        let idea = await Idea.findById(idea_id)
        if (!idea || idea == -1) throw new Error(`Error fetching idea, idea_id= ${idea_id}`)
        if (!idea?._doc) throw new Error(`Idea not found, idea_id= ${idea_id}`)

        if (type != undefined && TYPE_REV[type] == undefined) throw new Error(`Invalid type, type= ${type}`)

        const updated_idea = {
            ...idea._doc,
            idea_id,
            type,
            entry: entry ? entry : idea.entry,
            target: target ? target : idea.target,
            stop: stop ? stop : idea.stop,
            qty: qty ? qty : idea.qty
        }

        const order = await Place_Buy_Order(updated_idea)
        if (!order || order == -1) throw new Error(`Error placing buy order, idea_details= ${JSON.stringify(updated_idea)}`)

        return http.send_json(200, order)
    }
    catch ({ message }) {
        log.error(`Oder.handler : /order/buy : ${message}`)

        return http.send_message(400, message)
    }
})

router.post('/webhook', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        const {
            id: order_id, side, status, qty, remainingQuantity, filledQty,
            limitPrice, stopPrice, type, orderValidity, source, message,
            symbol, tradedPrice
        } = req.body

        if (process.env.SYSTEM_STATUS == "OFF") {
            log.info(`Order.handler : /order/webhook : recived order status update but system stopped, symbol= ${symbol}, order_id= ${order_id}, source= ${SOURCE_REV[source]} status= ${STATUS_REV[status]}, datetime= ${DateTime.To_String()}`)
            return http.send_status(200)
        }
        log.info(`Oder.handler : /order/webhook, symbol= ${symbol}, order_id= ${order_id}, source= ${SOURCE_REV[source]} status= ${STATUS_REV[status]}, datetime= ${DateTime.To_String()}`)

        Twilio.Send_WhatsApp_Message(
            `Order *${STATUS_REV[status]}*📨 : \`\`\`${DateTime.Timestamp()}\`\`\`
            Symbol: *${symbol}* ${SIDE_REV[side]} at ${tradedPrice} qty.: ${filledQty}, ${message}`
        ).catch(_ => log.error(`Order.handler : /order/webhook : Error sending whatsapp message`))

        //if (SOURCE_REV[source] != API) return http.send_status(200)

        let result = -1
        switch (STATUS_REV[status]) {
            case CANCELLED:
            case REJECTED:
            case EXPIRED:
                result = (side == SIDE[BUY]) ?
                    await Order.findOneAndUpdate({ buy_order_id: order_id }, {
                        order_entry_time: 0,
                        buy_order_id: "0",
                        status: CANCELLED,
                        effective_entry: 0,
                        message: message
                    }) :
                    await Order.findOneAndUpdate({ sell_order_id: order_id }, {
                        order_exit_time: 0,
                        sell_order_id: "0",
                        status: FILLED,
                        exit_price: 0,
                        message: message
                    })
                break

            case FILLED:
            case TRANSIST:
                result = (side == SIDE[BUY]) ?
                    await Order.findOneAndUpdate({ buy_order_id: order_id }, {
                        filled_qty: filledQty,
                        effective_entry: tradedPrice,
                        status: STATUS_REV[status],
                        current_price: tradedPrice,
                        message: message
                    }) :
                    await Order.findOneAndUpdate({ sell_order_id: order_id }, {
                        exit_price: tradedPrice,
                        status: qty == filledQty ? EXITED : STATUS_REV[status],
                        current_price: tradedPrice,
                        message: message
                    })
                break

            default:
                result = -1
                break
        }

        if (result == -1) throw new Error(`Error updatign order, symbol= ${symbol}, order_id= ${order_id}, source= ${SOURCE_REV[source]} status= ${STATUS_REV[status]}, datetime= ${DateTime.To_String()}`)

        return http.send_status(200)
    }
    catch ({ message }) {
        log.error(`Oder.handler : /order/webhook : ${message}`)

        return http.send_status(200)
    }
})

router.post('/sell', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        const { buy_order_id, exit, type } = req.body

        log.info(`Order.handler : /order/sell`)

        if (type != undefined && TYPE_REV[type] == undefined) throw new Error(`Invalid type, type= ${type}`)

        const order = await Place_Sell_Order({ buy_order_id, exit, type })
        if (!order || order == -1) throw new Error(`Error placing sell order,  buy_order_id= ${buy_order_id}, symbol= ${symbol}, exit= ${exit}, filled_qty= ${filled_qty}`)

        return http.send_json(200, order)
    }
    catch ({ message }) {
        log.error(`Order.handler : /order/sell : ${message}`)

        return http.send_message(400, message)
    }
})

router.get('/all', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        log.info('Order.handler : /order/all')

        const orders = await Get_All_Orders_Today()
        if (!orders || orders == -1) throw new Error("Error fething orders")

        return http.send_json(200, orders)
    }
    catch ({ message }) {
        log.error(`Order.handler : /order/all : ${message}`)

        return http.send_message(400, message)
    }
})

router.post('/cancel', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        const { order_id, symbol } = req.body

        log.info(`Order.handler : /order/cancel`)

        const order = await Place_Cancel_Order({ order_id })
        if (!order || order == -1) throw new Error(`Error placing cancel order,  order_id= ${order_id}, symbol= ${symbol}`)

        return http.send_json(200, "Order cancelled")
    }
    catch ({ message }) {
        log.error(`Order.handler : /order/sell : ${message}`)

        return http.send_message(400, message)
    }
})

module.exports = router