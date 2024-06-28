const { TYPE, LIMIT, SIDE, BUY, SELL, MARKET, STATUS, FILLED, CANCELLED, PENDING, WAITING } = require('../config.cjs')
const symbol_master = require('../meta/symbol.master')
const { Order } = require('../models')
const { log, Fyers, DateTime } = require('../utils')

class OrderEvent {
    static event = Object.freeze({
        buy: 'buy',
        sell: 'sell',
        cancel: 'cancel'
    })

    static #on_buy_callbacks = []
    static #on_sell_callbacks = []
    static #on_cancel_callbacks = []

    static async brought(order) {
        OrderEvent.#on_buy_callbacks.forEach(fn => fn(order))
    }

    static async sold(order) {
        OrderEvent.#on_sell_callbacks.forEach(fn => fn(order))
    }

    static async cancelled(order) {
        OrderEvent.#on_cancel_callbacks.forEach(fn => fn(order))
    }

    constructor(type, fn) {
        if (typeof fn != 'function') throw new Error('Event callback must be a funtion')

        switch (type) {
            case OrderEvent.event.buy:
                OrderEvent.#on_buy_callbacks.push(fn)
                break
            case OrderEvent.event.sell:
                OrderEvent.#on_sell_callbacks.push(fn)
                break
            case OrderEvent.event.cancel:
                OrderEvent.event.cancel.push(fn)
                break

            default: throw new Error('Not a valid order event')
        }
    }
}

const Get_All_Orders_Today = async (filter) => {
    try {
        const range_from = DateTime.DateNum_From_Date(DateTime.Get_Previous_N_Dates()[0])
        const range_to = DateTime.DateNum_From_Date(DateTime.Get_Next_N_Dates()[0])
        let orders = await Order.find({ time: { $gte: range_from, $lt: range_to }, ...filter })

        if (!orders || orders == -1) throw new Error(`Error fetching orders, range_from= ${range_from}, range_to= ${range_to}, filter= ${filter}`)

        orders = !Array.isArray(orders) ?
            [] :
            orders.map(({
                _doc: {
                    _id: order_id,
                    __v,
                    ...order
                }
            }) => ({
                order_id,
                ...order
            }))

        return orders
    }
    catch ({ message }) {
        log.error(`Order.lib : Get_All_Orders_Today : ${message}`)

        return -1
    }
}

const Place_Buy_Order = async ({ idea_id, symbol, time, entry, target, stop, type = TYPE[LIMIT], qty }) => {
    try {
        let order = {
            symbol: symbol_master[symbol], qty, type,
            side: SIDE[BUY], productType: "INTRADAY", limitPrice: type == TYPE[LIMIT] ? entry : 0,
            stopPrice: 0, validity: "DAY", stopLoss: 0,
            takeProfit: 0, offlineOrder: false, disclosedQty: 0
        }
        const order_id = await Fyers.Place_Order(order)
        if (!order_id || order_id == -1) throw new Error(`Error placing order, order_details= ${JSON.stringify(order)}`)

        const order_entry_time = DateTime.DateNum_Today() + DateTime.TimeNum_Now()
        let new_order = new Order({
            idea_id, symbol, time, entry, effective_entry: 0, target,
            stop, order_entry_time, buy_order_id: String(order_id),
            sell_order_id: '0', status: PENDING, filled_qty: 0,
            exit_price: 0, order_exit_time: 0, current_price: 0
        })
        new_order = await new_order.save()
        if (!new_order || order == -1) throw new Error(`Error saving order, order_details= ${JSON.stringify(order)}`)
        new_order = new_order._doc

        OrderEvent.brought(String(new_order._id), order, { idea_id, symbol, time, entry, target, stop, type })


        return { ...new_order, order_id }
    }
    catch ({ message }) {
        log.error(`Order.lib : Place_Buy_Order : ${message}, idea_details= {"idea_id": "${idea_id}", "symbol": "${symbol}", "time": "${time}", "entry": "${entry}", "target": "${target}", "stop": "${stop}"}`)

        return -1
    }
}

const Place_Sell_Order = async ({ buy_order_id, exit, type = TYPE[LIMIT] }) => {
    let system_generated_order = false

    try {
        const order = await Order.findOne({ buy_order_id: buy_order_id })
        if (order == -1) throw new Error(`Error fetching order, symbol= ${symbol}, buy_order_id= ${buy_order_id}`)
        if (!order || !order._doc) throw new Error(`Order not found, symbol= ${symbol}, buy_order_id= ${buy_order_id}`)

        if (order._doc.sell_order_id != "0") return { ...order._doc, order_id }

        system_generated_order = order._doc.status == WAITING

        let new_order = {
            symbol: symbol_master[order.symbol], qty: order.filled_qty, type,
            side: SIDE[SELL], productType: "INTRADAY", limitPrice: type == TYPE[MARKET] ? 0 : exit,
            stopPrice: 0, validity: "DAY", stopLoss: 0,
            takeProfit: 0, offlineOrder: false, disclosedQty: 0
        }
        const order_id = await Fyers.Place_Order(new_order)
        if (!order_id || order_id == -1) throw new Error(`Error placing sell order, symbol= ${order.symbol}, buy_order_id=  ${buy_order_id}`)

        OrderEvent.sold(order_id, new_order, order._doc)

        const order_exit_time = DateTime.DateNum_Today() + DateTime.TimeNum_Now()
        new_order = await Order.findOneAndUpdate(({ buy_order_id }, {
            status: PENDING,
            sell_order_id: String(order_id),
            order_exit_time: order_exit_time
        }))
        if (!new_order || new_order == -1) throw new Error(`Error updating sell order, order_deatils= ${JSON.stringify(order._doc)}`)

        new_order = new_order._doc

        return { ...new_order, order_id }
    }
    catch ({ message }) {
        log.error(`Order.lib : Place_Sell_Order : ${message}, buy_order_id= ${buy_order_id} symbol= ${symbol}, exit= ${exit}, filled_qty= ${filled_qty}, type = ${type}`)

        system_generated_order && await Order.findOneAndUpdate({ buy_order_id }, { status: FILLED })

        return -1
    }
}

const Place_Cancel_Order = async ({ order_id }) => {
    try {
        let order = await Order.findById(order_id)
        if (order == -1) throw new Error(`Error fetching order, oder_id= ${order_id}`)
        if (!order || !order._doc) throw new Error(`Order not found, order_id= ${order_id}`)

        order = order._doc
        if (order.status != PENDING) {
            log.info(`Order status changed, canceling rejected, status= ${order.status}, symbol= ${order.symbol}, order_id= ${order_id}`)
            return 1
        }

        const cancel = await Fyers.Cancel_Order({ order_id: order.buy_order_id })
        if (!cancel || cancel == -1) throw new Error(`Error canceling order, symbol= ${order.symbol}, order_id= ${order_id}`)

        OrderEvent.cancelled(cancel, { order_id }, order)

        return 1
    }
    catch ({ message }) {
        log.error(`Order.lib : Cancel_Order Buy : ${message}, order_id= ${order_id}`)

        return -1
    }
}

module.exports = {
    OrderEvent,
    Get_All_Orders_Today,
    Place_Buy_Order,
    Place_Sell_Order,
    Place_Cancel_Order
}