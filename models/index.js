const { request } = require('express');

module.exports = {
    Idea: require('./idea.model.cjs'),
    Alert: require('./alert.model.cjs'),
    Order: require('./order.model.cjs')
}