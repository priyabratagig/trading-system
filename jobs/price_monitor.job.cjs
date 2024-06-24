const { CronJob } = require('cron')
const { log, DateTime, Twilio } = require('../utils')
const { TYPE, MARKET, FILLED, TRANSIST, WAITING } = require('../config.cjs')
const { Last_N_Candles, Get_All_Orders_Today, Place_Sell_Order } = require('../libs')
const { Order } = require('../models')

const Price_Monitor = async () => {
    try {
        log.info('Price_Monitor.job : Price_Monitor')

        const orders = await Get_All_Orders_Today({ status: { $in: [FILLED, TRANSIST] }, sell_order_id: { $eq: "0" } })
        if (!orders || orders == -1) throw new Error("Error fetching orders")

        const time = DateTime.Now()
        for (const order of orders) {
            const { symbol, buy_order_id, target, stop } = order
            const candles = await Last_N_Candles(symbol, time)
            if (!candles || candles == -1) throw new Error(`Error fetching candles, oder_details= ${JSON.stringify(order._doc)}`)

            const [, , high, , close] = candles[0]

            const next_candle_time = DateTime.Get_Next_N_15Min_Time()[0]
            let wait = DateTime.Get_Time_Diff_MS(time, next_candle_time)
            wait = wait < 60000 ? 0 : wait - 60000

            if (close <= stop || high >= target) {
                log.info(`Price_Monitor.job : Price_Monitor, sell ${symbol} due to ${close <= stop ? 'stop' : 'target'} at ${DateTime.To_String()}`)

                setTimeout(_ => {
                    Place_Sell_Order({ buy_order_id, type: TYPE[MARKET] })
                }, wait)

                const new_order = await Order.findOneAndUpdate({ buy_order_id: order.buy_order_id }, { status: WAITING })
                if (!new_order || new_order == -1) throw new Error(`Order cannot be updated, order_details= ${JSON.stringify(order._doc)}`)

                Twilio.Send_WhatsApp_Message(
                    `*IMPORTANT📌* :
                    ${close <= stop ? 'Stop' : 'Target'} hit, *${Symbol}* by ${close <= stop ? close : high}₹ at \`\`\`${DateTime.To_String(DateTime.Datetime_From_DateTimeNum(ideas[0].time)).split(' GMT')[0]}\`\`\``
                ).catch(_ => log.error(`Price_Monitor.job : Price_Monitor : Error sending whatsapp message`))
            }
        }
    }
    catch ({ message }) {
        log.error(`Price_Monitor.job : Price_Monitor : ${message}`)

        const result = Twilio.Send_WhatsApp_Message(
            `Danger📢 : Error in Price_Monitor`
        )
        if (result == -1) log.error(`Price_Monitor.job : Price_Monitor : Error sending whatsapp message`)

        return -1
    }
}

const job = new CronJob(
    '0,15,30,45 9-15 * * 1-5',
    Price_Monitor,
    null,
    false,
    'Asia/Kolkata'
)

const start_job = new CronJob(
    '15 9 * * 1-5',
    () => {
        job.start()
        log.info(`Price_Monitor.job : start_job, starting job at ${DateTime.To_String()}`)

        const result = Twilio.Send_WhatsApp_Message(`Price_Monitor.job : start_job, starting job at ${DateTime.To_String()}`)
        if (result == -1) log.error(`Price_Monitor.job : start_job : Error sending whatsapp message`)
    },
    null,
    false,
    'Asia/Kolkata'
)

const stop_job = new CronJob(
    '30 15 * * 1-5',
    () => {
        job.stop()
        log.info(`Price_Monitor.job : stop_job, stopped at ${DateTime.To_String()}`)

        const result = Twilio.Send_WhatsApp_Message(`Price_Monitor.job : stop_job, stopped at ${DateTime.To_String()}`)
        if (result == -1) log.error(`Price_Monitor.job : stop_job : Error sending whatsapp message`)
    },
    false,
    true,
    'Asia/Kolkata'
)


const Subscribe_Price_Monitor = () => {
    log.info(`Price_Monitor.job : Subscribe_Price_Monitor`)

    start_job.start()
    stop_job.start()

    const start_timeNum = 915
    const stop_timeNum = 1530
    const start_Week_day = 1
    const stop_week_day = 5
    const current_timeNum = DateTime.TimeNum_Now()
    const current_week_day = DateTime.Now().getDay()

    if (
        (current_timeNum >= start_timeNum && current_timeNum < stop_timeNum) &&
        (current_week_day >= start_Week_day && current_week_day <= stop_week_day)
    ) {
        job.start()
        log.info(`Price_Monitor.job : Subscribe_Price_Monitor, starting job at ${DateTime.To_String()}`)

        const result = Twilio.Send_WhatsApp_Message(`Price_Monitor.job : Subscribe_Price_Monitor, starting job at ${DateTime.To_String()}`)
        if (result == -1) log.error(`Price_Monitor.job : Subscribe_Price_Monitor : Error sending whatsapp message`)
    }
}

module.exports = Subscribe_Price_Monitor
