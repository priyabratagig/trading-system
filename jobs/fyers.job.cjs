const { FyersEvent, log, Twilio } = require('../utils')
const { Set_Funds, Delete_Funds } = require('../libs')
const { ACCESS_TOKEN_VALIDITY, REFRESH_TOKEN_VALIDITY } = require('../config.cjs')

const Subscribe_Fyers_Job = () => {
    log.info('Fyers.job : Subscribe_Fyers_Job')

    let logout_task_id = null
    const logout_aftre_15Days = (Fyers) => {
        clearTimeout(logout_task_id)
        const log_out = async () => {
            log.info('Fyers.job : logout_aftre_15Days')
            Fyers.Logout()
            Twilio.Send_WhatsApp_Message(
                `Fyers.job : logout_aftre_15Days : Loggedout from session`
            ).catch(_ => log.error(`Fyers.job : logout_aftre_15Days : Error sending whatsapp message`))
        }
        logout_task_id = setTimeout(log_out, REFRESH_TOKEN_VALIDITY * 24 * 60 * 60 * 1000)
    }
    new FyersEvent(FyersEvent.event.login, logout_aftre_15Days)

    let refresh_token_task_id = null
    const refresh_token_after_24Hrs = (Fyers) => {
        clearTimeout(refresh_token_task_id)
        const refresh_token = async () => {
            log.info('Fyers.job : refresh_token_after_24Hrs')
            Fyers.Refresh_Token()
            Twilio.Send_WhatsApp_Message(
                `Fyers.job : refresh_token_after_24Hrs : Session refreshed`
            ).catch(_ => log.error(`Fyres.job : refresh_token_after_24Hrs : Error sending whatsapp message`))
        }
        refresh_token_task_id = setTimeout(refresh_token, ACCESS_TOKEN_VALIDITY * 60 * 60 * 1000)
    }
    new FyersEvent(FyersEvent.event.login, refresh_token_after_24Hrs)
    new FyersEvent(FyersEvent.event.refresh, refresh_token_after_24Hrs)

    let set_fund_task_id = null
    const set_fund_after_refresh = () => {
        clearImmediate(set_fund_task_id)
        const set_fund = _ => {
            log.info('Fyers.job : set_fund_after_refresh')
            Set_Funds()
        }
        set_fund_task_id = setImmediate(set_fund)
    }
    new FyersEvent(FyersEvent.event.login, set_fund_after_refresh)
    new FyersEvent(FyersEvent.event.refresh, set_fund_after_refresh)

    let delete_fund_task_id = null
    const delete_fund_after_logout = () => {
        clearImmediate(delete_fund_task_id)
        const delete_fund = _ => {
            log.info('Fyers.job : delete_fund_after_logout')
            Delete_Funds()
        }
        delete_fund_task_id = setImmediate(delete_fund)
    }
    new FyersEvent(FyersEvent.event.logout, delete_fund_after_logout)

    let auto_trade_off_task_id = null
    const auto_trade_off_after_logout = () => {
        clearImmediate(auto_trade_off_task_id)
        const auto_trade_off = _ => {
            log.info('Fyers.job : auto_trade_off_after_logout')
            process.env.AUTO_TRADE = 'OFF'
            Twilio.Send_WhatsApp_Message(
                `Fyers.job : auto_trade_off_after_logout : Auto trade off`
            ).catch(_ => log.error(`Fyers.job : auto_trade_off_after_logout : Error sending whatsapp message`))
        }
        auto_trade_off_task_id = setImmediate(auto_trade_off)
    }
    new FyersEvent(FyersEvent.event.logout, auto_trade_off_after_logout)
}


module.exports = Subscribe_Fyers_Job