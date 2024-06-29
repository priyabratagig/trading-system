module.exports = {
    authenticate: require('./auth.middleware.cjs'),
    usecors: require('./cors.middleware.cjs')
}