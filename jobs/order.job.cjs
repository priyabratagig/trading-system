const { Place_Cancel_Order, OrderEvent } = require('../libs')
const { DateTime, log } = require('../utils')

const Subscribe_Orber_Jobs = () => {
    log.info('Order.job : Subscribe_Orber_Jobs')

    let cancel_buy_order_task_id = null
    const cancel_buy_order = (order_id, order_meta, previous_order) => {
        clearTimeout(cancel_buy_order)

        const at = DateTime.Get_Next_N_15Min_Time()[0]
        const wait = DateTime.Get_Time_Diff_MS(DateTime.Now(), at)
        cancel_buy_order_task_id = setTimeout(async () => {
            await Place_Cancel_Order({ order_id })
        }, wait)
    }
    new OrderEvent(OrderEvent.event.buy, cancel_buy_order)
}

module.exports = Subscribe_Orber_Jobs