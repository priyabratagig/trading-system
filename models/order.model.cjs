const mongoose = require('mongoose')
const { STATUS, EXITED } = require('../config.cjs')

const OrderSchema = new mongoose.Schema({
    idea_id: {
        type: mongoose.Schema.Types.ObjectId, required: [true, "Idea id is required"], ref: "Idea"
    },
    symbol: {
        type: String, required: [true, "Order.model : Symbol is required"]
    },
    time: {
        type: Number, require: [true, "Order.model : Datetime is requuired"]
    },
    entry: {
        type: Number, require: [true, "Order.model : Entry price is required"]
    },
    target: {
        type: Number, require: [true, "Order.model : Target price is required"]
    },
    stop: {
        type: Number, require: [true, "Order.model : Stop price is required"]
    },
    order_entry_time: {
        type: Number, require: [true, "Order.model : Order entry time is requuired"]
    },
    order_exit_time: {
        type: Number, require: [true, "Order.model : Order exit time is requuired"]
    },
    buy_order_id: {
        type: String, require: [true, "Order.model : Buy order id is required"]
    },
    sell_order_id: {
        type: String, require: [true, "Order.model : Sell order id is required"]
    },
    status: {
        type: String, require: [true, "Order.model : Status is required"], enum: [...Object.keys(STATUS), EXITED]
    },
    filled_qty: {
        type: Number, require: [true, "Order.model : Filled quantity is required"]
    },
    effective_entry: {
        type: Number, require: [true, "Order.model : Effective entry price is required"]
    },
    exit_price: {
        type: Number, require: [true, "Order.model : Exit price is required"]
    },
    current_price: {
        type: Number, require: [true, "Order.model : Current price is required"]
    },
    message: {
        type: String, default: ""
    }
})

module.exports = mongoose.model("Order", OrderSchema)
