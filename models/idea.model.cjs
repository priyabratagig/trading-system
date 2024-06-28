const mongoose = require('mongoose')

const IdeaSchema = new mongoose.Schema({
    symbol: {
        type: String, required: [true, "Idea.model : Symbol is required"]
    },
    time: {
        type: Number, required: [true, "Idea.model : Datetime is required"]
    },
    entry: {
        type: Number, required: [true, "Idea.model : Entry price is required"]
    },
    target: {
        type: Number, required: [true, "Idea.model : Target price is required"]
    },
    stop: {
        type: Number, required: [true, "Idea.model : Stop price is required"]
    },
    qty: {
        type: Number, required: [true, 'Idea.model : Quantity is required']
    }
})

module.exports = mongoose.model("Idea", IdeaSchema)
