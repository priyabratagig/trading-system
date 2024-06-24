const { log, Fyers, Twilio } = require('../utils')

const Set_Funds = async () => {
    try {
        const funds = await Fyers.Get_Funds()
        if (funds == -1) throw new Error('Error setting funds')

        process.env.FUNDS = Math.floor(funds)

        return funds
    }
    catch ({ message }) {
        log.error(`Funds.lib : Set_Funds : ${message}`)

        return -1
    }
}

const Delete_Funds = async () => {
    try {
        process.env.FUNDS = 0

        return 0
    }
    catch ({ message }) {
        log.error(`Funds.lib : Delete_Funds : ${message}`)

        return -1
    }
}

const Get_Funds = () => {
    const funds = parseInt(process.env.FUNDS, 10)
    if (!funds) {
        Twilio.Send_WhatsApp_Message(`Funds.lib : Get_Fund, funds not set`).catch(_ =>
            log.error(`Funds.lib : Get_Fund : Error sending whatsapp message`)
        )
        throw new Error('Equity balance not set')
    }
    return funds
}


module.exports = {
    Set_Funds,
    Get_Funds,
    Delete_Funds
}