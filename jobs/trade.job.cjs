const { Order } = require('../models')
const { log, DateTime } = require('../utils')
const { CANCELLED, REJECTED, EXPIRED, TYPE, LIMIT } = require('../config.cjs')
const { Place_Buy_Order } = require('../libs')

const AutoTrade = async (ideas) => {
    // At most I can only have 3 order per day
    // CANCELLED, REJECTED and EXPIRED orders are not counted
    try {
        if (process.env.AUTO_TRADE !== 'ON') {
            log.info('Trade.job : AutoTrade : AutoTrade OFF')
            return 1
        }

        const time_num = DateTime.TimeNum_Now()
        if (time_num < 930 || time_num >= 1045) {
            log.info(`Trade.job : AutoTrade : Entry time expired, time= ${time_num}`)
            return 1
        }

        const range_from = DateTime.DateNum_From_Date(DateTime.Get_Previous_N_Dates()[0])
        const range_to = DateTime.DateNum_From_Date(DateTime.Get_Next_N_Dates()[0])
        let orders = await Order.find({ time: { $gte: range_from, $lt: range_to }, status: { $nin: [CANCELLED, REJECTED, EXPIRED] } })
        if (!orders || orders == -1) throw new Error(`Error fetching orders, range_from= ${range_from}, range_to= ${range_to}`)

        if (orders.length >= 3) {
            log.info(`Trade.job : AutoTrade, reached limits ${orders.length} trades today`)
            return 1
        }

        log.info(`Trade.job : AutoTrade, ${orders.length} trades today`)

        const remaining_orders = 3 - orders.length

        for (let i = 0; i < remaining_orders; i++) {
            // Place order
            const order = await Place_Buy_Order({ ...ideas[i], type: TYPE[LIMIT] })
            if (!order || order == -1) throw new Error('Error placing order')
        }

        return 1
    }
    catch ({ message }) {
        log.error(`Trade.job : AutoTrade : ${message}`)

        return -1
    }
}

module.exports = AutoTrade