const mongoose = require('mongoose')

const AlertSchema = new mongoose.Schema({
    symbol: {
        type: String, required: [true, "Alert.model : Symbol is required"]
    },
    time: {
        type: Number, required: [true, "Alert.model : Datetime is required"]
    }
})

module.exports = mongoose.model("Alert", AlertSchema)
