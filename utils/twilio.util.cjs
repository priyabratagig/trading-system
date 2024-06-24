const { TWILIO_SENDER_NUMBER, TWILIO_RECEIVER_NUMBER, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = require('../config.cjs')
const twilio = require('twilio')
const log = require('./log.util.cjs')

class Twilio {
    static #Client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    static async Send_WhatsApp_Message(message) {
        try {
            const { error_message, error_code } = await Twilio.#Client.messages.create({
                body: message,
                from: `whatsapp:${TWILIO_SENDER_NUMBER}`,
                to: `whatsapp:${TWILIO_RECEIVER_NUMBER}`
            })
            if (error_message || error_code) throw new Error(`Error sending message, ${message}`)

            return 1
        }
        catch ({ message }) {
            log.error(`Twilio.util : Send_WhatsApp_Message : ${message}`)

            return -1

        }
    }
}

module.exports = Twilio