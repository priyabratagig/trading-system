const { APP_ID, SECRET_KEY, APP_ID_HASH, USER_PIN } = require('../config.cjs')
const FyersAPI = require("fyers-api-v3")
const log = require('./log.util.cjs')
const axios = require('axios')
const DateTime = require('./datetime.util.cjs')
const Twilio = require("./twilio.util.cjs")

class FyersEvent {
    static event = Object.freeze({
        logout: 'logout',
        login: 'login',
        refresh: 'refresh'
    })

    static #on_login_callbacks = []
    static #on_token_refresh_callbacks = []
    static #on_logout_callback = []

    static async loggedin(Fyers = Fyers) {
        FyersEvent.#on_login_callbacks.forEach(fn => fn(Fyers))
    }

    static async toke_refreshed(Fyers = Fyers) {
        FyersEvent.#on_token_refresh_callbacks.forEach(fn => fn(Fyers))
    }

    static async loggedout(Fyers = Fyers) {
        FyersEvent.#on_logout_callback.forEach(fn => fn(Fyers))
    }

    constructor(type, fn) {
        if (typeof fn != 'function') throw new Error('Event callback must be a funtion')

        switch (type) {
            case FyersEvent.event.login:
                FyersEvent.#on_login_callbacks.push(fn)
                break
            case FyersEvent.event.refresh:
                FyersEvent.#on_token_refresh_callbacks.push(fn)
                break
            case FyersEvent.event.logout:
                FyersEvent.#on_logout_callback.push(fn)
                break

            default: throw new Error('Not a valid fyers event')
        }
    }
}

class Fyers {
    static #login_link = null
    static #access_token = null
    static #refresh_token = null

    static #Check_Error({ code, s, message }) {
        if (isNaN(code) || Number(code) > 0) return false
        if (s.toLowerCase() != 'error') return false

        throw new Error(message)
    }

    static async #Notify_Access_Token() {
        if (Fyers.#access_token) return 1

        const result = await Twilio.Send_WhatsApp_Message(`Fyers.util : Notify_Access_Token, access token not set`)
        if (result == -1) log.error(`Fyers.util : Notify_Access_Token : Error sending whatsapp message`)

        throw new Error('Access token not set')
    }

    static Logout() {
        Fyers.#login_link = null
        Fyers.#access_token = null
        Fyers.#refresh_token = null

        FyersEvent.loggedout(Fyers)
    }

    static async Generate_Login_Link() {
        try {
            if (!!Fyers.#login_link) return Fyers.#login_link

            const fyers_model = new FyersAPI.fyersModel()
            fyers_model.setAppId(APP_ID)
            fyers_model.setRedirectUrl(`https://trade.fyers.in/api-login/redirect-uri/index.html`)
            const response = await fyers_model.generateAuthCode()
            Fyers.#Check_Error(response)

            Fyers.#login_link = response

            return response
        }
        catch ({ message }) {
            Fyers.Logout()
            log.error(`Fyers.util : Generate_Login_Link : ${message}`)

            return -1
        }
    }

    static async Login(auth_code) {
        try {
            if (!!Fyers.#refresh_token) return Fyers.#refresh_token
            if (!Fyers.#login_link) throw new Error('Login link not genereated')

            const fyers_model = new FyersAPI.fyersModel()
            fyers_model.setAppId(APP_ID)
            fyers_model.setRedirectUrl("https://trade.fyers.in/api-login/redirect-uri/index.html")
            const response = await fyers_model.generate_access_token({ secret_key: SECRET_KEY, auth_code })
            Fyers.#Check_Error(response)

            const { access_token, refresh_token } = response
            Fyers.#access_token = access_token
            Fyers.#refresh_token = refresh_token

            Fyers.#login_link = null
            FyersEvent.loggedin(Fyers)

            return Fyers.#refresh_token
        }
        catch ({ message }) {
            Fyers.Logout()
            log.error(`Fyers.util : Login:  ${message}`)

            return -1
        }
    }

    static async Refresh_Token() {
        try {
            if (!Fyers.#refresh_token) throw new Error('Refresh token not set')

            const requestConfig = {
                baseURL: 'https://api-t1.fyers.in/api/v3/validate-refresh-token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    grant_type: "refresh_token",
                    appIdHash: APP_ID_HASH,
                    "refresh_token": Fyers.#refresh_token,
                    "pin": USER_PIN
                }
            }
            const response = await axios(requestConfig)
            Fyers.#Check_Error(response.data)

            Fyers.#login_link = null
            FyersEvent.toke_refreshed(Fyers)

            return 1
        }
        catch ({ message }) {
            Fyers.Logout()
            log.error(`Fyers.util : Refresh_Token :  ${message}`)

            return -1
        }
    }

    static async Fetch_Candle({ symbol, range_from, range_to }) {
        try {
            await Fyers.#Notify_Access_Token()

            const fyers_model = new FyersAPI.fyersModel()
            fyers_model.setAppId(APP_ID)
            fyers_model.setRedirectUrl(`https://trade.fyers.in/api-login/redirect-uri/index.html`)
            fyers_model.setAccessToken(Fyers.#access_token)

            // altered
            range_from.setDate(range_from.getDate() - 4)
            range_to.setDate(range_to.getDate() - 4)
            range_from.setHours(10)
            range_to.setHours(11)
            range_from = DateTime.Datetime_To_EPOCH(range_from)
            range_to = DateTime.Datetime_To_EPOCH(range_to)

            const data = {
                symbol,
                range_from,
                range_to,
                resolution: "15",
                date_format: "0",
                cont_flag: "0"
            }
            const response = await fyers_model.getHistory(data)
            Fyers.#Check_Error(response)

            return response.candles
        }
        catch ({ message }) {
            log.error(`Fyers.util : Fetch_Candle : ${message}`)

            return -1
        }
    }

    // altered
    static async Place_Order({ symbol, qty, type, side, productType, limitPrice, stopPrice = 0, disclosedQty = 0, validity = 'DAY', stopLoss = 0, takeProfit = 0, orderTag = 'VolumeBreakout' }, id) {
        try {
            await Fyers.#Notify_Access_Token()

            const fyers_model = new FyersAPI.fyersModel()
            fyers_model.setAppId(APP_ID)
            fyers_model.setRedirectUrl(`https://trade.fyers.in/api-login/redirect-uri/index.html`)
            fyers_model.setAccessToken(Fyers.#access_token)

            const data = {
                symbol,
                qty,
                type,
                side,
                productType,
                limitPrice,
                stopPrice,
                disclosedQty,
                validity,
                "offlineOrder": false,
                stopLoss,
                takeProfit,
                orderTag
            }
            const response = await fyers_model.place_order(data)
            //Fyers.#Check_Error(response)
            const order_id = id

            return order_id
        }
        catch ({ message }) {
            log.error(`Fyers.util : Place_Order : ${message}`)

            return -1
        }
    }

    static async Get_Orders() {
        try {
            await Fyers.#Notify_Access_Token()

            const fyers_model = new FyersAPI.fyersModel()
            fyers_model.setAppId(APP_ID)
            fyers_model.setRedirectUrl(`https://trade.fyers.in/api-login/redirect-uri/index.html`)
            fyers_model.setAccessToken(Fyers.#access_token)

            const response = await fyers_model.get_orders()
            Fyers.#Check_Error(response)

            const orders = response.orderBook

            return orders
        }
        catch ({ message }) {
            log.error(`Fyers.util : Get_Orders : ${message}`)

            return -1
        }
    }

    static async Cancel_Order({ order_id }) {
        try {
            await Fyers.#Notify_Access_Token()

            const fyers_model = new FyersAPI.fyersModel()
            fyers_model.setAppId(APP_ID)
            fyers_model.setRedirectUrl(`https://trade.fyers.in/api-login/redirect-uri/index.html`)
            fyers_model.setAccessToken(Fyers.#access_token)

            const data = {
                id: order_id
            }
            const response = await fyers_model.cancel_order(data)
            Fyers.#Check_Error(response)

            return 1
        }
        catch ({ message }) {
            log.error(`Fyers.util : Cancel_Order : ${message}`)

            return -1
        }
    }

    static async Get_Order_By_ID({ order_id }) {
        try {
            await Fyers.#Notify_Access_Token()

            const fyers_model = new FyersAPI.fyersModel()
            fyers_model.setAppId(APP_ID)
            fyers_model.setRedirectUrl(`https://trade.fyers.in/api-login/redirect-uri/index.html`)
            fyers_model.setAccessToken(Fyers.#access_token)

            const data = { order_id }
            const response = await fyers_model.get_filtered_orders(data)
            Fyers.#Check_Error(response)

            return response.orderBook[0]
        }
        catch ({ message }) {
            log.error(`Fyers.util : Get_Order_By_ID : ${message}`)

            return -1
        }
    }

    static async Get_Funds() {
        try {
            await Fyers.#Notify_Access_Token()

            const fyers_model = new FyersAPI.fyersModel()
            fyers_model.setAppId(APP_ID)
            fyers_model.setRedirectUrl(`https://trade.fyers.in/api-login/redirect-uri/index.html`)
            fyers_model.setAccessToken(Fyers.#access_token)

            const response = await fyers_model.get_funds()
            Fyers.#Check_Error(response)

            const funds = response.fund_limit.pop().equityAmount

            return funds
        }
        catch ({ message }) {
            log.error(`Fyers.util : Get_Fund : ${message}`)

            return -1
        }
    }
}

module.exports = {
    Fyers,
    FyersEvent
}