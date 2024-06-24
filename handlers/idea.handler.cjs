const router = require("express").Router()
const { log, HTTP } = require('../utils')
const { Get_Ideas_Today, Delete_Idea } = require('../libs')

router.get('/today', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        log.info('Idea.handler : /idea/today')

        const ideas = await Get_Ideas_Today()
        if (!ideas || ideas == -1) throw new Error("Error fetching ideas")

        return http.send_json(200, ideas)
    }
    catch ({ message }) {
        log.error(`Idea.handler : /idea/today : ${message}`)

        return http.send_message(400, message)
    }
})

router.delete('/delete/:idea_id', async (req, res) => {
    const http = new HTTP(req, res)
    try {
        const { idea_id } = req.params
        if (typeof idea_id != 'string' || idea_id.length < 1) throw new Error(`Idea_id not provided, ${idea_id}`)

        log.info('Idea.handler : /idea/delete/:idea_id')

        const deleted = await Delete_Idea({ idea_id })
        if (!deleted || deleted == -1) throw new Error('Error deleting idea')

        return http.send_message(200, 'Idea deleted successfuly')
    }
    catch ({ message }) {
        log.error(`Idea.handler : /idea/delete/:idea_id : ${message}`)

        return http.send_message(400, message)
    }
})

module.exports = router