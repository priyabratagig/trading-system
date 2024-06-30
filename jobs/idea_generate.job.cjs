const { Idea } = require('../models')
const { log, Twilio, DateTime } = require('../utils')
const { Get_Buy_Target_Stop, Get_Funds } = require('../libs')
const { default: AutoTrade } = require('./trade.job.cjs')

const Generate_Ideas = async (alerts) => {
    try {
        log.info('Idea.job : Generate_Ideas')

        const funds = Get_Funds()
        const position_size = Math.floor(funds / 3)

        const ideas = []
        for (let alert of alerts) {
            try {
                const { symbol, time } = alert
                const result = await Get_Buy_Target_Stop(symbol, time)
                if (result == -1) throw new Error(`Error generating idea : symbol= ${symbol}, time= ${time}`)

                const [entry, target, stop] = result
                const qty = Math.floor(position_size / entry)

                ideas.push({ symbol, time, entry, target, stop, qty })
            }
            catch ({ message }) {
                log.error(`Idea.job : Generate_Ideas : ${message}`)
            }
        }

        if (ideas.length == 0) throw new Error(`No ideas generated`)

        Twilio.Send_WhatsApp_Message(
            `Generated Ideas✨ : \`\`\`${DateTime.To_String(DateTime.Datetime_From_DateTimeNum(ideas[0].time)).split(' GMT')[0]}\`\`\`
            ${ideas.reduce((str, { symbol, entry, target, stop, qty }) => {
                const message = `\nSymbol *${symbol}*:\n Entry: *${entry}*  Target: *${target}*  Stop: *${stop}* Qty.: *${qty}*`
                return str = str + message
            }, '')}`
        ).catch(_ => log.error(`Idea.job : Generate_Ideas : Error sending whatsapp message`))

        let new_ideas = await Idea.insertMany(ideas)
        if (!new_ideas || new_ideas == -1) throw new Error(`Ideas not saved, ideas= ${JSON.stringify(ideas)}`)
        new_ideas = !Array.isArray(new_ideas) ?
            [] :
            new_ideas.map(({
                _doc: {
                    _id: idea_id,
                    __v,
                    ...idea
                }
            }) => ({
                idea_id: String(idea_id),
                ...idea
            }))

        AutoTrade(ideas)

        return new_ideas
    }
    catch ({ message }) {
        log.error(`Idea.job : Generate_Ideas : ${message}`)

        return -1
    }
}

module.exports = Generate_Ideas