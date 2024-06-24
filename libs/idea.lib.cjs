const { DateTime, log } = require('../utils')
const { Idea } = require('../models')

const Get_Ideas_Today = async () => {
    try {
        const range_from = DateTime.DateNum_From_Date(DateTime.Get_Previous_N_Dates()[0])
        const range_to = DateTime.DateNum_From_Date(DateTime.Get_Next_N_Dates()[0])
        let ideas = await Idea.find({ time: { $gte: range_from, $lt: range_to } })

        ideas = !Array.isArray(ideas) ?
            [] :
            ideas.map(({
                _doc: {
                    _id: idea_id,
                    __v,
                    ...idea
                }
            }) => ({
                idea_id: String(idea_id),
                ...idea
            }))

        return ideas
    }
    catch ({ message }) {
        log.error(`Idea.lib : Get_Ideas_Today : ${message}`)

        return -1
    }
}

const Delete_Idea = async ({ idea_id }) => {
    try {
        const result = await Idea.findByIdAndDelete(idea_id)
        if (!result || result == -1) throw new Error('Not deleted')

        return 1
    }
    catch ({ message }) {
        log.error(`Idea.lib : Delete_Idea : ${message}, idea_id= ${idea_id}`)

        return -1
    }
}

module.exports = {
    Get_Ideas_Today,
    Delete_Idea
}