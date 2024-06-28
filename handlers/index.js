module.exports = {
    auth: require('./auth.handler.cjs'),
    alert: require('./alert.handler.cjs'),
    funds: require('./funds.handler.cjs'),
    idea: require('./idea.handler.cjs'),
    order: require('./order.handler.cjs'),
    token: require('./access_token.handler.cjs'),
    logs: require('./logs.handler.cjs'),
    system: require('./system.handler.cjs'),
    auto_trade: require('./auto-trade.handler.cjs'),
}