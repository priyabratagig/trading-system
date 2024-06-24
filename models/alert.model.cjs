const mongoose = require('mongoose')

const AlertSchema = new mongoose.Schema({
    symbol: {
        type: String, required: [true, "Alter.model : Symbol is required"]
    },
    time: {
        type: Number, require: [true, "Alter.model : Datetime is requuired"]
    }
})

module.exports = mongoose.model("Alert", AlertSchema)
