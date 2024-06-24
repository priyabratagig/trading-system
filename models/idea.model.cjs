const mongoose = require('mongoose')

const IdeaSchema = new mongoose.Schema({
    symbol: {
        type: String, required: [true, "Idea.model : Symbol is required"]
    },
    time: {
        type: Number, require: [true, "Idea.model : Datetime is requuired"]
    },
    entry: {
        type: Number, require: [true, "Idea.model : Entry price is required"]
    },
    target: {
        type: Number, require: [true, "Idea.model : Target price is required"]
    },
    stop: {
        type: Number, require: [true, "Idea.model : Stop price is required"]
    },
    qty: {
        type: Number, require: [true, 'Idea.model : Quantity is required']
    }
})

module.exports = mongoose.model("Idea", IdeaSchema)
