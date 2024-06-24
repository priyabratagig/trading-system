const symbol_master = require('../meta/symbol.master')
const { log, DateTime, Fyers } = require('../utils')

const Last_N_Candles = async (symbol, time, n = 2) => {
    try {
        n = n < 2 ? 2 : n
        const [range_to, range_from] = DateTime.Get_Pervious_N_15Min_Time({ time, n })

        const result = await Fyers.Fetch_Candle({ symbol: symbol_master[symbol], range_from, range_to })
        if (result == -1) throw new Error('Error fetching history')
        if (result.len == 0) throw new Error('Error no candle found')

        return result
    }
    catch ({ message }) {
        log.error(`Price.lib : Last_N_Candles : ${message}, symbol= ${symbol}, n= ${n}`)

        return -1
    }
}

const Get_Buy_Target_Stop = async (symbol, time) => {
    try {
        const candles = await Last_N_Candles(symbol, time)
        if (candles == -1) throw new Error('Error no candles')

        const buy_price = Math.ceil(candles.pop()[1])
        const stop = Math.floor(Math.max(candles.pop()[3], (buy_price * 0.97)))
        const target = buy_price + (buy_price - stop) * 5

        return [buy_price, target, stop]
    }
    catch ({ message }) {
        log.error(`Price.lib : Get_Buy_Target_Stop : ${message}, symbol= ${symbol}, time= ${time}`)

        return -1
    }
}

module.exports = {
    Last_N_Candles,
    Get_Buy_Target_Stop
}